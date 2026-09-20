"use client";

import { FileText, X } from "lucide-react";
import { useEffect, useState } from "react";

interface PdfPreviewModalProps {
  url: string;
  fileName?: string;
  onClose: () => void;
}

export default function PdfPreviewModal({
  url,
  fileName = "Book preview.pdf",
  onClose,
}: PdfPreviewModalProps) {
  const [displayUrl, setDisplayUrl] = useState("");

  useEffect(() => {
    if (url.startsWith("blob:") || url.startsWith("data:")) {
      setDisplayUrl(url);
      return;
    }

    setDisplayUrl(`/api/pdf-proxy?url=${encodeURIComponent(url)}`);
  }, [url]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4'
      role='dialog'
      aria-modal='true'
      aria-label={`Preview ${fileName}`}
    >
      <button
        type='button'
        aria-label='Close PDF preview'
        className='absolute inset-0 bg-slate-950/80 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative z-10 flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a1d24] shadow-2xl'>
        <div className='flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#0e1117] px-4 py-3 sm:px-5'>
          <div className='flex min-w-0 items-center gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10'>
              <FileText className='h-4 w-4 text-orange-400' />
            </div>

            <div className='min-w-0'>
              <p className='truncate text-sm font-semibold text-white'>{fileName}</p>
              <p className='text-xs text-slate-400'>Book preview</p>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white'
            title='Close preview'
            aria-label='Close preview'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='relative flex-1 bg-[#2b2f36]'>
          {displayUrl ? (
            <iframe
              src={`${displayUrl}#toolbar=0&navpanes=0`}
              className='h-full w-full border-0'
              title={fileName}
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center text-sm text-slate-400'>
              Loading preview...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
