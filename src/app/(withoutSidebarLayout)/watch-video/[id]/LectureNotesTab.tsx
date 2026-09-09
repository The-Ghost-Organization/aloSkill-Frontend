import { Download, FileText } from "lucide-react";
import type { PrivateLesson } from "../../courses/allCourses.types";

export default function LectureNotesTab({ content }: { content: PrivateLesson | null }) {
  const notes = [
    {
      id: 1,
      title: "Getting Started with Webflow",
      description: "Complete guide to setting up your Webflow account",
      date: "Oct 26, 2020",
      pages: 5,
    },
    {
      id: 2,
      title: "Webflow Interface Overview",
      description: "Understanding the main components of Webflow",
      date: "Oct 26, 2020",
      pages: 8,
    },
  ];

  return (
    <div className='space-y-4'>
      {/* {notes.map(note => (
        <div
          key={note.id}
          className='flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer'
        >
          <div className='flex items-start space-x-4'>
            <div className='p-3 bg-orange-50 rounded-lg'>
              <FileText className='w-6 h-6 text-orange-500' />
            </div>
            <div>
              <h4 className='font-semibold text-gray-900'>{note.title}</h4>
              <p className='text-sm text-gray-600 mt-1'>{note.description}</p>
              <div className='flex items-center space-x-4 mt-2 text-xs text-gray-500'>
                <span>{note.date}</span>
                <span>•</span>
                <span>{note.pages} pages</span>
              </div>
            </div>
          </div>
          <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <Download className='w-5 h-5 text-gray-600' />
          </button>
        </div>
      ))} */}
      <h4 className='font-semibold text-lg text-gray-800 mb-2'>Lecture Notes : </h4>
      {content?.notes ? content.notes : "No lecture notes available for this lecture."}
    </div>
  );
}
