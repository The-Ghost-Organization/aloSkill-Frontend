import { MessageSquare, ThumbsUp, Reply } from 'lucide-react';
import type { PrivateLesson } from '../../courses/allCourses.types';

export default function CommentsTab({content}: {content: PrivateLesson | null}) {
  const comments = [
    {
      id: 1,
      author: 'Sarah Johnson',
      avatar: '/api/placeholder/40/40',
      date: '2 days ago',
      content: 'Great explanation! The step-by-step guide really helped me understand how to set up my Webflow account.',
      likes: 12,
      replies: 3
    },
    {
      id: 2,
      author: 'Michael Chen',
      avatar: '/api/placeholder/40/40',
      date: '5 days ago',
      content: 'I had some issues with the signup process, but this lecture cleared everything up. Thanks!',
      likes: 8,
      replies: 1
    },
    {
      id: 3,
      author: 'Emma Williams',
      avatar: '/api/placeholder/40/40',
      date: '1 week ago',
      content: 'Very informative. Looking forward to the rest of the course!',
      likes: 15,
      replies: 2
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">154 Comments</h3>
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option>Most Recent</option>
          <option>Most Liked</option>
          <option>Oldest First</option>
        </select>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-pink-400 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                    <p className="text-xs text-gray-500">{comment.date}</p>
                  </div>
                </div>
                <p className="text-gray-700 mt-2">{comment.content}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-orange-500 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{comment.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-orange-500 transition-colors">
                    <Reply className="w-4 h-4" />
                    <span>{comment.replies} replies</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <textarea
          placeholder="Add a comment..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
        <div className="flex justify-end mt-3">
          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
}
