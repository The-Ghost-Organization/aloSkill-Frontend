// src/components/PdfPreviewModal.tsx
"use client";

import { FileText, X } from "lucide-react";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker here so it only runs on the client
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


interface PdfPreviewModalProps {
  url: string;
  fileName: string;
  onClose: () => void;
}

export default function PdfPreviewModal({ url, fileName, onClose }: PdfPreviewModalProps) {
  const [numPages, setNumPages] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/80 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='relative z-10 w-full max-w-4xl h-[85vh] bg-[#1a1d24] border border-white/10 rounded shadow-xl flex flex-col overflow-hidden'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0e1117] shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-indigo-500/10 rounded-lg'>
              <FileText
                size={16}
                className='text-indigo-400'
              />
            </div>
            <div>
              <p className='text-sm font-semibold leading-tight text-white'>{fileName}</p>
              <p className='text-xs text-gray-500'>Pages: {numPages || "Loading..."}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 rounded text-gray-400 hover:text-white hover:bg-white/10'
          >
            <X size={20} />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto bg-[#2b2f36] p-4 flex justify-center'>
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className='text-white text-sm'>Loading PDF...</div>}
            error={<div className='text-red-400 text-sm'>Failed to load PDF.</div>}
            className='flex flex-col gap-4'
          >
            {Array.from(new Array(numPages), (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={600}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className='shadow-lg'
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
