import { apiClient } from "@/lib/api/client";
import * as tus from "tus-js-client";

export type HostingType = "FREE" | "PREMIUM";
export interface HostingPolicy {
  defaultHosting: HostingType;
  allowFreePaid: boolean;
  freeEnabled: boolean;
  premiumEnabled: boolean;
  maxUploadBytes: number;
  allowedMimeTypes: string[];
}
export interface UploadStatus {
  id: string;
  status: string;
  receivedBytes: number;
  fileSize: number;
  uploadError: string | null;
  fileName: string;
  contentUrl: string | null;
  duration: number | null;
  signature?: {
    videoId: string;
    libraryId: string;
    token: string;
    expires: number;
    collectionId?: string;
  };
}
export async function getUpload(id: string): Promise<UploadStatus> {
  const response = await apiClient.get<UploadStatus>(`/course/video/uploads/${id}`);
  if (!response.success || !response.data)
    throw new Error(response.message ?? "Cannot retrieve upload status.");
  return response.data;
}

// The existing file picker and TUS upload remain the Premium Hosting path.
// Only job IDs are saved locally; provider credentials never enter storage.
export async function uploadLessonVideo(
  file: File,
  options: {
    hostingType: HostingType;
    courseId?: string;
    title: string;
    description?: string;
    acknowledged: boolean;
    youtubeDisclosureAccepted: boolean;
    key: string;
    onJob: (id: string) => void;
    onProgress: (value: string) => void;
  }
): Promise<UploadStatus> {
  const key = `aloskill:video:${options.key}:${options.hostingType}:${file.name}:${file.size}:${file.lastModified}`;
  let job: UploadStatus | undefined;
  const existing = localStorage.getItem(key);
  if (existing) {
    job = await getUpload(existing);
    if (job.status === "CANCELLED" || job.status === "RETIRED") job = undefined;
    if (job?.status === "FAILED") {
      const retry = await apiClient.post<UploadStatus>(`/course/video/uploads/${job.id}/retry`);
      if (!retry.success || !retry.data) throw new Error(retry.message ?? "Retry failed.");
      job = await getUpload(job.id);
    }
  }
  if (!job) {
    const response = await apiClient.post<UploadStatus>("/course/video/uploads", {
      hostingType: options.hostingType,
      courseId: options.courseId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      title: options.title,
      description: options.description,
      acknowledged: options.acknowledged,
      youtubeDisclosureAccepted: options.youtubeDisclosureAccepted,
    });
    if (!response.success || !response.data)
      throw new Error(response.message ?? "Upload could not start.");
    job = response.data;
    localStorage.setItem(key, job.id);
  }
  options.onJob(job.id);
  if (job.status === "STAGING") {
    if (options.hostingType === "FREE") {
      let offset = job.receivedBytes;
      while (offset < file.size) {
        const form = new FormData();
        const chunk = file.slice(offset, Math.min(offset + 8 * 1024 * 1024, file.size));
        form.append("file", chunk, file.name);
        form.append("offset", String(offset));
        const response = await apiClient.postFormData(
          `/course/video/uploads/${job.id}/chunks`,
          form
        );
        if (!response.success)
          throw new Error(
            response.message ?? "Upload interrupted. Select this file again to resume."
          );
        offset += chunk.size;
        options.onProgress(`${((offset / file.size) * 100).toFixed(1)}% uploaded`);
      }
    } else {
      const signature = job.signature;
      if (!signature)
        throw new Error("Upload authorization unavailable. Select the file again to retry.");
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: "https://video.bunnycdn.com/tusupload",
          retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
          chunkSize: 5 * 1024 * 1024,
          fingerprint: async () => `aloskill-${job!.id}`,
          headers: {
            AuthorizationSignature: signature.token,
            AuthorizationExpire: String(signature.expires),
            VideoId: signature.videoId,
            LibraryId: signature.libraryId,
          },
          metadata: {
            filetype: file.type,
            title: options.title,
            ...(signature.collectionId ? { collection: signature.collectionId } : {}),
          },
          onError: reject,
          onProgress: (uploaded, total) =>
            options.onProgress(`${((uploaded / total) * 100).toFixed(1)}% uploaded`),
          onSuccess: () => resolve(),
        });
        void upload
          .findPreviousUploads()
          .then(previous => {
            if (previous[0]) upload.resumeFromPreviousUpload(previous[0]);
            upload.start();
          })
          .catch(reject);
      });
    }
    const complete = await apiClient.post(`/course/video/uploads/${job.id}/complete`);
    if (!complete.success)
      throw new Error(
        complete.message ?? "Could not queue processing. Select the file again to retry."
      );
  }
  options.onProgress("Processing video. You can return to this draft later.");
  // Processing may outlive the browser. The saved job ID allows the editor to
  // recover status after navigation/reload without initiating another upload.
  const deadline = Date.now() + 30 * 60_000;
  while (Date.now() < deadline) {
    job = await getUpload(job.id);
    if (job.status === "READY") return job;
    if (["FAILED", "CANCELLED", "RETIRED"].includes(job.status))
      throw new Error(job.uploadError ?? "Upload was cancelled.");
    options.onProgress(
      job.status === "UPLOADING" ? "Transferring video for processing…" : "Processing video…"
    );
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  throw new Error(
    "Processing is continuing in the background. Return to this draft to check status."
  );
}
