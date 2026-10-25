import * as tus from 'tus-js-client';
import { apiClient } from '@/lib/api/client';

export type HostingType = 'FREE' | 'PREMIUM';
export interface HostingPolicy {
  defaultHosting: HostingType; allowFreePaid: boolean; freeEnabled: boolean; premiumEnabled: boolean;
  freeUnavailableReason?: string | null;
  workerAvailable?: boolean;
  maxUploadBytes: number; allowedMimeTypes: string[];
}
export interface UploadStatus {
  id: string; status: string; receivedBytes: number; fileSize: number; uploadError: string | null;
  fileName: string; contentUrl: string | null; duration: number | null;
  transferredBytes?: number; processingProgress?: number | null;
  workerAvailable?: boolean; statusMessage?: string; lastSyncedAt?: string | null;
  signature?: { videoId: string; libraryId: string; token: string; expires: number; collectionId?: string };
}
export interface VideoUploadProgress {
  stage: 'SOURCE' | 'QUEUED' | 'TRANSFER' | 'PROCESSING' | 'READY' | 'FAILED';
  bytes: number; total: number; percent: number | null; message: string;
  bytesPerSecond?: number; remainingSeconds?: number;
}
export function progressFromJob(job: UploadStatus): VideoUploadProgress {
  const stage = job.status === 'STAGING' ? 'SOURCE' : job.status === 'UPLOADING' ? 'TRANSFER'
    : job.status === 'QUEUED' ? 'QUEUED' : job.status === 'READY' ? 'READY'
    : ['FAILED', 'CANCELLED', 'RETIRED'].includes(job.status) ? 'FAILED' : 'PROCESSING';
  const bytes = stage === 'SOURCE' ? job.receivedBytes : stage === 'TRANSFER' ? job.transferredBytes ?? 0 : job.fileSize;
  const percent = stage === 'READY' ? 100 : stage === 'PROCESSING' ? job.processingProgress ?? null
    : stage === 'SOURCE' || stage === 'TRANSFER' ? Math.min(100, bytes / Math.max(1, job.fileSize) * 100) : null;
  const message = job.statusMessage ?? (stage === 'QUEUED' ? 'Waiting for a transfer worker' : stage === 'PROCESSING' ? 'Upload complete. Hosting is processing the video.' : stage === 'TRANSFER' ? 'Transferring video to hosting' : stage === 'READY' ? 'Video ready' : stage === 'FAILED' ? job.uploadError ?? 'Upload failed' : 'Uploading to ALOSKILL');
  return { stage, bytes, total: job.fileSize, percent, message };
}
export function formatVideoBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export async function getUpload(id: string): Promise<UploadStatus> {
  const response = await apiClient.get<UploadStatus>(`/course/video/uploads/${id}`);
  if (!response.success || !response.data) throw new Error(response.message ?? 'Cannot retrieve upload status.');
  return response.data;
}

// The existing file picker and TUS upload remain the Premium Hosting path.
// Only job IDs are saved locally; provider credentials never enter storage.
export async function uploadLessonVideo(file: File, options: {
  hostingType: HostingType; courseId?: string; title: string; description?: string;
  acknowledged: boolean; youtubeDisclosureAccepted: boolean; key: string;
  onJob: (id: string) => void; onProgress: (value: VideoUploadProgress) => void;
}): Promise<UploadStatus> {
  const key = `aloskill:video:${options.key}:${options.hostingType}:${file.name}:${file.size}:${file.lastModified}`;
  let job: UploadStatus | undefined;
  const existing = localStorage.getItem(key);
  if (existing) {
    job = await getUpload(existing);
    if (job.status === 'CANCELLED' || job.status === 'RETIRED') job = undefined;
    if (job?.status === 'FAILED') {
      const retry = await apiClient.post<UploadStatus>(`/course/video/uploads/${job.id}/retry`);
      if (!retry.success || !retry.data) throw new Error(retry.message ?? 'Retry failed.');
      job = await getUpload(job.id);
    }
  }
  if (!job) {
    const response = await apiClient.post<UploadStatus>('/course/video/uploads', {
      hostingType: options.hostingType, courseId: options.courseId, fileName: file.name, fileSize: file.size,
      mimeType: file.type, title: options.title, description: options.description,
      acknowledged: options.acknowledged, youtubeDisclosureAccepted: options.youtubeDisclosureAccepted,
    });
    if (!response.success || !response.data) throw new Error(response.message ?? 'Upload could not start.');
    job = response.data;
    localStorage.setItem(key, job.id);
  }
  options.onJob(job.id);
  const began = Date.now();
  const startingOffset = job.receivedBytes;
  let lastReportAt = 0;
  const sourceProgress = (bytes: number) => {
    if (Date.now() - lastReportAt < 200 && bytes < file.size) return;
    lastReportAt = Date.now();
    const elapsed = Math.max(0.1, (Date.now() - began) / 1000);
    const bytesPerSecond = Math.max(0, bytes - startingOffset) / elapsed;
    options.onProgress({ stage: 'SOURCE', bytes, total: file.size, percent: Math.min(100, bytes / file.size * 100),
      message: 'Uploading source file', bytesPerSecond,
      ...(bytesPerSecond > 0 ? { remainingSeconds: Math.ceil((file.size - bytes) / bytesPerSecond) } : {}) });
  };
  sourceProgress(job.receivedBytes);
  if (job.status === 'STAGING') {
    if (options.hostingType === 'FREE') {
      const sendChunk = await apiClient.createFormUploader();
      let offset = job.receivedBytes;
      while (offset < file.size) {
        // Keep multipart requests below the existing 5 MB security middleware
        // limit, including form boundaries and metadata. This is not a file cap.
        const chunk = file.slice(offset, Math.min(offset + 4 * 1024 * 1024, file.size));
        let saved = false;
        for (let attempt = 0; attempt < 4; attempt++) {
          const form = new FormData();
          form.append('file', chunk, file.name);
          form.append('offset', String(offset));
          const response = await sendChunk(`/course/video/uploads/${job.id}/chunks`, form,
            fraction => sourceProgress(Math.min(file.size, offset + Math.floor(chunk.size * fraction))));
          if (response.success) { offset += chunk.size; saved = true; break; }
          // A response can be lost after a successful commit. Reconcile the
          // durable offset before retrying so the same bytes are not duplicated.
          const current = await getUpload(job.id);
          if (current.receivedBytes > offset) { offset = current.receivedBytes; saved = true; break; }
          if (attempt === 3) throw new Error(response.message ?? 'Upload interrupted. Select the same file to resume.');
          await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
        }
        if (!saved) throw new Error('Upload could not save this chunk. Select the same file to resume.');
        sourceProgress(offset);
      }
    } else {
      const signature = job.signature;
      if (!signature) throw new Error('Upload authorization unavailable. Select the file again to retry.');
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: 'https://video.bunnycdn.com/tusupload',
          retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000], chunkSize: 5 * 1024 * 1024,
          fingerprint: async () => `aloskill-${job!.id}`,
          headers: { AuthorizationSignature: signature.token, AuthorizationExpire: String(signature.expires), VideoId: signature.videoId, LibraryId: signature.libraryId },
          metadata: { filetype: file.type, title: options.title, ...(signature.collectionId ? { collection: signature.collectionId } : {}) },
          onError: reject,
          onProgress: uploaded => sourceProgress(uploaded),
          onSuccess: () => resolve(),
        });
        void upload.findPreviousUploads().then(previous => {
          if (previous[0]) upload.resumeFromPreviousUpload(previous[0]);
          upload.start();
        }).catch(reject);
      });
    }
    const complete = await apiClient.post(`/course/video/uploads/${job.id}/complete`);
    if (!complete.success) throw new Error(complete.message ?? 'Could not queue processing. Select the file again to retry.');
  }
  // The page polls the durable job while the instructor keeps editing. Do not
  // hold a spinner or lock all hosting controls for the encoding period.
  job = await getUpload(job.id);
  options.onProgress(progressFromJob(job));
  if (['FAILED', 'CANCELLED', 'RETIRED'].includes(job.status)) throw new Error(job.uploadError ?? 'Upload was cancelled.');
  return job;
}
