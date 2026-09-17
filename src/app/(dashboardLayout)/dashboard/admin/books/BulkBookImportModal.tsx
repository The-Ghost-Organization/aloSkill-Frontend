"use client";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { apiClient } from "../../../../../lib/api/client";
import type { BulkBookImportResult } from "./books.types";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const MAX_MEDIA_FILE_SIZE = 100 * 1024 * 1024;
const MEDIA_EXTENSIONS = /\.(jpe?g|png|webp|gif|pdf)$/i;

function extractBunnyUrl(payload: unknown): string {
  const candidates: unknown[] = [payload];

  if (payload && typeof payload === "object") {
    const value = payload as Record<string, unknown>;
    candidates.push(value["url"], value["fileUrl"], value["location"], value["data"]);

    if (value["data"] && typeof value["data"] === "object") {
      const nested = value["data"] as Record<string, unknown>;
      candidates.push(nested["url"], nested["fileUrl"], nested["location"]);
    }
  }

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;

    let normalized = candidate.trim().replace(/^["']|["']$/g, "");
    if (!normalized) continue;

    if (normalized.startsWith("//")) {
      normalized = `https:${normalized}`;
    } else if (/^[\w.-]+\.b-cdn\.net\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    try {
      const url = new URL(normalized);
      if (url.protocol === "https:") {
        return url.href;
      }
    } catch {
      // Try the next supported response shape.
    }
  }

  throw new Error(
    "Bunny upload succeeded, but the server did not return a valid HTTPS CDN URL. Check BUNNY_PULL_ZONE_URL."
  );
}

export default function BulkBookImportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BulkBookImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const reset = () => {
    setFile(null);
    setMediaFiles([]);
    setProgress("");
    setError("");
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const selectMediaFiles = (selected: FileList | null) => {
    setError("");
    setResult(null);
    const next = Array.from(selected ?? []);
    const invalid = next.find(
      item => !MEDIA_EXTENSIONS.test(item.name) || item.size > MAX_MEDIA_FILE_SIZE
    );
    if (invalid) {
      setError(`“${invalid.name}” must be JPG, PNG, WebP, GIF, or PDF and no larger than 100 MB.`);
      setMediaFiles([]);
      return;
    }
    const names = new Set<string>();
    const duplicate = next.find(item => {
      const normalizedName = item.name.trim().toLowerCase();
      return names.has(normalizedName) || !names.add(normalizedName);
    });
    if (duplicate) {
      setError(
        `Duplicate filename “${duplicate.name}”. Every selected media filename must be unique.`
      );
      setMediaFiles([]);
      return;
    }
    setMediaFiles(next);
  };

  const close = () => {
    if (isImporting) return;
    setIsOpen(false);
    reset();
  };

  const selectFile = (selectedFile?: File) => {
    setError("");
    setResult(null);
    if (!selectedFile) {
      setFile(null);
      return;
    }
    const hasExcelExtension = /\.(xlsx|xls)$/i.test(selectedFile.name);
    if (!EXCEL_TYPES.includes(selectedFile.type) && !hasExcelExtension) {
      setError("Only .xlsx or .xls files are allowed.");
      setFile(null);
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("The Excel file cannot exceed 5 MB.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const importBooks = async () => {
    if (!file) {
      setError("Select an Excel file first.");
      return;
    }
    setIsImporting(true);
    setError("");
    setResult(null);
    try {
      const mediaUrls: Record<string, string> = {};
      for (const [index, mediaFile] of mediaFiles.entries()) {
        setProgress(`Uploading media ${index + 1} of ${mediaFiles.length}: ${mediaFile.name}`);
        const mediaData = new FormData();
        mediaData.append("file", mediaFile);
        const folder =
          mediaFile.type.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(mediaFile.name)
            ? "books/covers"
            : "books/pdfs";
        const uploadResponse = await apiClient.postFormData<string>(
          `/course/instructor-file-upload?folder=${encodeURIComponent(folder)}`,
          mediaData
        );
        if (!uploadResponse.success || !uploadResponse.data) {
          throw new Error(uploadResponse.message || `Could not upload ${mediaFile.name}.`);
        }
        mediaUrls[mediaFile.name] = extractBunnyUrl(uploadResponse.data);
      }
      setProgress("Importing book rows...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mediaUrls", JSON.stringify(mediaUrls));
      const response = await apiClient.postFormData<BulkBookImportResult>(
        "/book/bulk-upload-books",
        formData
      );
      if (!response.success || !response.data) {
        setError(response.message || "The book import could not be completed.");
        return;
      }
      setResult(response.data);
      if (response.data.imported > 0) router.refresh();
    } catch (importError: unknown) {
      setError(importError instanceof Error ? importError.message : "The book import failed.");
    } finally {
      setIsImporting(false);
      setProgress("");
    }
  };

  const failures = result?.results.filter(row => !row.success) ?? [];

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded border border-slate-700 bg-slate-900 text-slate-200 font-['Outfit'] font-semibold text-[13px] hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer"
      >
        <FileSpreadsheet size={14} />
        Import Excel
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <button
            type='button'
            aria-label='Close import dialog'
            className='absolute inset-0 bg-black/75 backdrop-blur-sm cursor-default'
            onClick={close}
          />
          <section className='relative z-10 flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded border border-slate-700 bg-[#070F1D] shadow-2xl'>
            <header className='flex items-start justify-between border-b border-slate-800 px-6 py-5'>
              <div>
                <h2 className="font-['Syne'] text-xl font-bold text-white">
                  Import Books From Excel
                </h2>
                <p className='mt-1 text-sm text-slate-400'>Upload up to 500 books in one file.</p>
              </div>
              <button
                type='button'
                onClick={close}
                disabled={isImporting}
                className='rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50'
              >
                <X size={18} />
              </button>
            </header>

            <div className='overflow-y-auto p-6'>
              <div className='mb-4 flex items-center justify-between rounded border border-amber-500/20 bg-amber-500/5 p-4'>
                <div>
                  <p className='text-sm font-semibold text-amber-300'>Use the Aloskill template</p>
                  <p className='mt-0.5 text-xs text-slate-400'>
                    Keep its header names and place books on the first worksheet.
                  </p>
                </div>
                <a
                  href='/templates/book-import-template.xlsx'
                  download
                  className='inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300'
                >
                  <Download size={14} /> Download
                </a>
              </div>

              <label className='relative flex min-h-36 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-slate-700 p-6 text-center transition-colors hover:border-orange hover:bg-orange/5'>
                <input
                  ref={inputRef}
                  type='file'
                  accept='.xlsx,.xls'
                  className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                  onChange={event => selectFile(event.target.files?.[0])}
                />
                <Upload
                  size={24}
                  className='mb-3 text-slate-500'
                />
                <span className='text-sm font-semibold text-slate-200'>
                  {file ? file.name : "Choose an Excel file"}
                </span>
                <span className='mt-1 text-xs text-slate-500'>
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : ".xlsx or .xls · maximum 5 MB"}
                </span>
              </label>

              <label className='relative mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-slate-700 p-5 text-center transition-colors hover:border-orange hover:bg-orange/5'>
                <input
                  type='file'
                  multiple
                  accept='.jpg,.jpeg,.png,.webp,.gif,.pdf'
                  className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                  onChange={event => selectMediaFiles(event.target.files)}
                />
                <Upload
                  size={20}
                  className='mb-2 text-slate-500'
                />
                <span className='text-sm font-semibold text-slate-200'>
                  Choose cover images and PDF files
                </span>
                <span className='mt-1 text-xs text-slate-500'>
                  {mediaFiles.length
                    ? `${mediaFiles.length} media file(s) selected`
                    : "Use coverImageFile, previewPdfFile, and ebookPdfFile in Excel"}
                </span>
              </label>

              {progress && <p className='mt-3 text-xs text-amber-300'>{progress}</p>}

              {error && (
                <div className='mt-4 flex gap-2 rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400'>
                  <AlertCircle
                    size={17}
                    className='mt-0.5 shrink-0'
                  />
                  {error}
                </div>
              )}

              {result && (
                <div className='mt-5'>
                  <div className='grid grid-cols-3 gap-3'>
                    <ResultCard
                      label='Total Rows'
                      value={result.total}
                      className='text-blue-400'
                    />
                    <ResultCard
                      label='Imported'
                      value={result.imported}
                      className='text-emerald-400'
                    />
                    <ResultCard
                      label='Failed'
                      value={result.failed}
                      className='text-red-400'
                    />
                  </div>
                  {result.failed === 0 && (
                    <div className='mt-4 flex items-center gap-2 rounded border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400'>
                      <CheckCircle2 size={17} />
                      All books were imported successfully.
                    </div>
                  )}
                  {failures.length > 0 && (
                    <div className='mt-4 overflow-hidden rounded border border-slate-800'>
                      <div className='border-b border-slate-800 bg-slate-900 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400'>
                        Rows requiring attention
                      </div>
                      <div className='max-h-56 overflow-auto'>
                        <table className='w-full text-left text-xs'>
                          <thead className='sticky top-0 bg-[#0B1424] text-slate-500'>
                            <tr>
                              <th className='px-4 py-2'>Row</th>
                              <th className='px-4 py-2'>Field</th>
                              <th className='px-4 py-2'>Problem</th>
                            </tr>
                          </thead>
                          <tbody className='divide-y divide-slate-800'>
                            {failures.flatMap(row =>
                              (row.errors ?? []).map((item, index) => (
                                <tr key={`${row.row}-${item.field}-${index}`}>
                                  <td className='px-4 py-2 font-mono text-slate-200'>{row.row}</td>
                                  <td className='px-4 py-2 text-slate-400'>{item.field}</td>
                                  <td className='px-4 py-2 text-red-400'>{item.message}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer className='flex justify-end gap-3 border-t border-slate-800 px-6 py-4'>
              <button
                type='button'
                onClick={close}
                disabled={isImporting}
                className='rounded border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50'
              >
                Close
              </button>
              <button
                type='button'
                onClick={importBooks}
                disabled={!file || isImporting}
                className='inline-flex items-center gap-2 rounded bg-linear-to-br from-orange to-orange-dark px-5 py-2 text-sm font-semibold text-white shadow shadow-orange-500/25 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isImporting ? (
                  <>
                    <Loader2
                      size={15}
                      className='animate-spin'
                    />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    Import Books
                  </>
                )}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

function ResultCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className='rounded border border-slate-800 bg-slate-900 p-3 text-center'>
      <strong className={`block font-mono text-xl ${className}`}>{value}</strong>
      <span className='text-[10px] uppercase tracking-widest text-slate-500'>{label}</span>
    </div>
  );
}
