import { CheckCircle2, MessageSquareText, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { InstructorDetail } from "../../../../types/instructor.types.ts";

type Review = InstructorDetail["reviews"][number];

export function ReviewsTab({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center'>
        <MessageSquareText className='mx-auto mb-4 h-12 w-12 text-gray-300' />
        <h3 className='text-xl font-semibold text-gray-700'>No course reviews yet</h3>
        <p className='mt-2 text-sm text-gray-500'>Verified learner reviews from this instructor&apos;s courses will appear here.</p>
      </div>
    );
  }

  return (
    <div className='space-y-5 animate-fade-in-content'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-[#DA7C36]'>Learner feedback</p>
          <h3 className='mt-1 text-xl font-bold text-[#074079]'>Course reviews</h3>
        </div>
        <span className='rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700'>
          {reviews.length} review{reviews.length === 1 ? "" : "s"}
        </span>
      </div>

      {reviews.map((review, index) => (
        <article
          key={review.id}
          className='rounded-xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5 transition-all duration-300 hover:border-[#DA7C36]/60 sm:p-6'
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <div className='flex items-start gap-4'>
            <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#DA7C36]/50 bg-gray-100'>
              <Image
                fill
                sizes='48px'
                src={review.avatarUrl || "/default-avatar.png"}
                alt={review.userDisplayName}
                className='object-cover'
              />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex min-w-0 flex-wrap items-center gap-2'>
                  <h4 className='truncate font-bold text-[#074079]'>{review.userDisplayName}</h4>
                  {review.verifiedEnrollment && (
                    <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700'>
                      <CheckCircle2 className='h-3 w-3' /> Verified learner
                    </span>
                  )}
                </div>
                <time className='text-xs text-gray-500'>{new Date(review.createdAt).toLocaleDateString()}</time>
              </div>

              <div className='mt-2 flex items-center gap-1'>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>

              {review.title && <h5 className='mt-3 text-sm font-bold text-gray-800'>{review.title}</h5>}
              {review.body && <p className='mt-2 text-sm leading-6 text-gray-600'>{review.body}</p>}

              {review.courseId ? (
                <Link
                  href={`/courses/${review.courseId}`}
                  className='mt-3 inline-flex text-xs font-semibold text-[#DA7C36] transition hover:text-orange-700 hover:underline'
                >
                  Course: {review.courseTitle}
                </Link>
              ) : (
                <p className='mt-3 text-xs font-semibold text-[#DA7C36]'>Course: {review.courseTitle}</p>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
