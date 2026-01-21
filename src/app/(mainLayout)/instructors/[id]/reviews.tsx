//reviews.tsx - REVIEWS TAB COMPONENT
import { Star } from "lucide-react";
import Image from "next/image";

interface Review {
  id: number;
  studentImage: string;
  studentName: string;
  date: string;
  rating: number;
  comment: string;
  courseTitle: string;
}

export function ReviewsTab({ reviews }: { reviews: Review[] }) {
  return (
    <div className='space-y-6 animate-fade-in-content'>
      {reviews.map((review, index) => (
        <div
          key={review.id}
          className='bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-100 hover:border-[#DA7C36] transition-all duration-300 animate-slide-in'
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className='flex items-start gap-4'>
            <Image
              width={48}
              height={48}
              src={review.studentImage}
              alt={review.studentName}
              className='w-12 h-12 rounded-full object-cover border-2 border-[#DA7C36]'
            />
            <div className='flex-1'>
              <div className='flex items-center justify-between mb-2'>
                <h4 className='font-bold text-[#074079]'>{review.studentName}</h4>
                <span className='text-xs text-gray-500'>{review.date}</span>
              </div>
              <div className='flex items-center gap-1 mb-2'>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className='text-gray-600 text-sm mb-2'>{review.comment}</p>
              <p className='text-xs text-[#DA7C36] font-semibold'>Course: {review.courseTitle}</p>
            </div>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out both;
        }
        @keyframes fade-in-content {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-content {
          animation: fade-in-content 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
