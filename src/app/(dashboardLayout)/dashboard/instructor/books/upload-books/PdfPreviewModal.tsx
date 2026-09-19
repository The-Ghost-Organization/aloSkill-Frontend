"use client";

import { FileText, PanelLeft, X } from "lucide-react";
import { useEffect, useState } from "react";

interface PdfPreviewModalProps {
  url: string;
  fileName?: string;
  onClose: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function PdfPreviewModal({
  url,
  fileName = "Document.pdf",
  onClose,
  onToggleSidebar,
  isSidebarOpen = false,
}: PdfPreviewModalProps) {
  const [displayUrl, setDisplayUrl] = useState<string>("");

  useEffect(() => {
    // If it's a remote URL, route through the local proxy to bypass CORS/CSP blocks
    // If it's a blob URL (URL.createObjectURL), use directly
    if (url.startsWith("blob:") || url.startsWith("data:")) {
      setDisplayUrl(url);
    } else {
      setDisplayUrl(`/api/pdf-proxy?url=${encodeURIComponent(url)}`);
    }
  }, [url]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/80 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className='relative z-10 w-full max-w-5xl h-[90vh] bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden'>
        {/* Header Toolbar */}
        <div className='flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#0e1117] shrink-0'>
          <div className='flex items-center gap-3 truncate'>
            {/* Breadcrumb / Sidebar Toggle Button */}
            {onToggleSidebar && (
              <button
                type='button'
                onClick={onToggleSidebar}
                className={`p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors ${
                  isSidebarOpen ? "bg-white/10 text-white" : ""
                }`}
                title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <PanelLeft size={18} />
              </button>
            )}

            <div className='p-2 bg-indigo-500/10 rounded-lg shrink-0'>
              <FileText
                size={18}
                className='text-indigo-400'
              />
            </div>
            <div className='truncate'>
              <p className='text-sm font-semibold text-white truncate'>{fileName}</p>
              <p className='text-xs text-gray-400'>PDF Document</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-2'>
            {/* Close Button */}
            <button
              onClick={onClose}
              className='p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors ml-2'
              title='Close modal'
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF Viewer Content Area */}
        <div className='flex-1 bg-[#2b2f36] relative'>
          {displayUrl ? (
            <iframe
              src={`${displayUrl}#toolbar=0&navpanes=0`}
              className='w-full h-full border-0'
              title={fileName}
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center text-gray-400 text-sm'>
              Loading preview...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
