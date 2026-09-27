"use client";

import { BookOpen, Download, X } from "lucide-react";
import { useEffect } from "react";

interface EbookReaderModalProps {
  title: string;
  fileName?: string;
  readUrl: string;
  downloadUrl?: string;
  onClose: () => void;
}

export function EbookReaderModal({
  title,
  fileName,
  readUrl,
  downloadUrl,
  onClose,
}: EbookReaderModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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
      aria-label={`Read ${title}`}
    >
      <button
        type='button'
        aria-label='Close eBook reader'
        className='absolute inset-0 bg-slate-950/80 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative z-10 flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a1d24] shadow-2xl'>
        <div className='flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#0e1117] px-4 py-3 sm:px-5'>
          <div className='flex min-w-0 items-center gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10'>
              <BookOpen className='h-4 w-4 text-orange-400' />
            </div>
            <div className='min-w-0'>
              <p className='truncate text-sm font-semibold text-white'>{title}</p>
              <p className='truncate text-xs text-slate-400'>{fileName || "Purchased eBook"}</p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {downloadUrl && (
              <a
                href={downloadUrl}
                className='hidden items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-600 sm:inline-flex'
              >
                <Download className='h-4 w-4' /> Download
              </a>
            )}
            <button
              type='button'
              onClick={onClose}
              className='flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white'
              aria-label='Close reader'
              title='Close reader'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>

        <div className='relative flex-1 bg-[#2b2f36]'>
          <iframe
            src={`${readUrl}#toolbar=1&navpanes=0`}
            className='h-full w-full border-0'
            title={`Read ${title}`}
          />
        </div>
      </div>
    </div>
  );
}
