"use client";

import { Download, File } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import type { PrivateLesson } from '../../courses/allCourses.types';

export default function AttachFileTab({content}: {content: PrivateLesson | null}) {
  const { id } = useParams<{ id: string }>();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const download = async (index: number, name: string) => {
    if (!content || downloading) return;
    setDownloading(`${content.id}:${index}`);
    setError('');
    try {
      const response = await fetch(`/api/course-attachments/${encodeURIComponent(id)}/${encodeURIComponent(content.id)}?file=${index}`);
      if (!response.ok) throw new Error(await response.text() || 'File could not be downloaded. Please try again.');
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = name.replace(/[\\/:*?"<>|\r\n]/g, '_') || 'attachment';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Download failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && <p role='alert' className='text-sm text-red-700'>{error}</p>}
      {content?.files && content.files.length > 0 ? (
        content.files.map((file,index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <File className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{file.name}</h4>
                {/* <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                  <span>{file.type}</span>
                  <span>•</span>
                  <span>{file.size}</span>
                  <span>•</span>
                  <span>{file.uploadedAt}</span>
                </div> */}
              </div>
            </div>
            <button type='button' disabled={downloading !== null} onClick={() => void download(index, file.name)} aria-label={`Download ${file.name}`} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 disabled:opacity-60">
              <Download className="w-4 h-4" />
              <span>{downloading === `${content.id}:${index}` ? 'Downloading…' : 'Download'}</span>
            </button>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-gray-500">
          <File className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No attachments available for this lecture</p>
        </div>
      )}
    </div>
  );
}
