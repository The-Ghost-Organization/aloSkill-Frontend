import { FadeIn } from "@/lib/course/utils.tsx";
import { Star } from "lucide-react";
import Image from "next/image";

function ReviewsTab({
  reviews,
  ratingAverage,
}: {
  reviews: any[] | undefined;
  ratingAverage: number;
}) {
  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Rating Summary */}
      <FadeIn>
        <div className='bg-gradient-to-br from-orange-50 to-purple-50 rounded-md sm:rounded-md p-4 sm:p-8 border-2 border-orange-200'>
          <div className='flex flex-col md:flex-row items-center gap-6 sm:gap-8'>
            <div className='text-center'>
              <div className='text-2xl font-black text-[#074079] mb-2'>{ratingAverage}</div>
              <div className='flex items-center justify-center mb-2'>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className='w-5 h-5 fill-[#fc9759] text-[#fc9759]'
                  />
                ))}
              </div>
              <p className=' text-sm text-gray-600'>Course Rating</p>
            </div>

            <div className='flex-1 space-y-2 w-full'>
              {[5, 4, 3, 2, 1].map(star => (
                <div
                  key={star}
                  className='flex items-center gap-2 sm:gap-3'
                >
                  <span className=' text-sm text-gray-600 w-6 sm:w-8'>{star}★</span>
                  <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-[#d15100] to-[#da7c36] transition-all duration-1000'
                      style={{
                        width: `${star === 5 ? 75 : star === 4 ? 20 : star === 3 ? 3 : star === 2 ? 1 : 1}%`,
                      }}
                    />
                  </div>
                  <span className=' text-sm text-gray-600 w-10 sm:w-12'>
                    {star === 5 ? "75%" : star === 4 ? "20%" : star === 3 ? "3%" : "1%"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Reviews */}
      <div className='space-y-3 sm:space-y-4'>
        {reviews?.map((review, index) => (
          <FadeIn
            key={review.id}
            delay={index * 100}
          >
            <div className='border border-gray-200 rounded-lg sm:rounded-md p-4 sm:p-6 hover:shadow-lg transition-all bg-white group'>
              <div className='flex items-start gap-3 sm:gap-4'>
                <div className='relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200 group-hover:ring-[#da7c36] transition-all'>
                  <Image
                    src={review.avatarUrl}
                    alt={review.userDisplayName}
                    fill
                    className='object-cover'
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-2'>
                    <h4 className='font-bold text-sm sm:text-base text-[#074079] group-hover:text-[#da7c36] transition-colors truncate'>
                      {review.userDisplayName}
                    </h4>
                    <span className=' text-gray-500 flex-shrink-0'>
                      {new Date(review?.createdAt ?? 0).toLocaleDateString()}
                    </span>
                  </div>
                  <div className='flex items-center mb-2 sm:mb-3'>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          star <= review.rating ? "fill-[#fc9759] text-[#fc9759]" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className=' text-sm text-gray-700 leading-relaxed'>{review.body}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
export default ReviewsTab;
