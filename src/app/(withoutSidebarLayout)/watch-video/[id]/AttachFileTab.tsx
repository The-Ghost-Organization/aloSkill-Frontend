import { Download, File } from 'lucide-react';
import type { PrivateLesson } from '../../courses/allCourses.types';

export default function AttachFileTab({content}: {content: PrivateLesson | null}) {
  const attachments = [
    {
      id: 1,
      name: 'Webflow_Signup_Guide.pdf',
      size: '2.4 MB',
      type: 'PDF Document',
      uploadedAt: 'Oct 26, 2020'
    }
  ];

  return (
    <div className="space-y-4">
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
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download</span>
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
