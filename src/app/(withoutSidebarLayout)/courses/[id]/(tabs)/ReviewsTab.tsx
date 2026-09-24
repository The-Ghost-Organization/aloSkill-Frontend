import { FadeIn } from "@/lib/course/utils.tsx";
import { MessageSquareText, Star } from "lucide-react";
import Image from "next/image";
import type { CourseDetailsPublic } from "../../allCourses.types.ts";

type Review = CourseDetailsPublic["reviews"][number];
type RatingBreakdown = CourseDetailsPublic["ratingBreakdown"];

function ReviewsTab({
  reviews,
  ratingAverage,
  ratingBreakdown,
}: {
  reviews: Review[] | undefined;
  ratingAverage: number;
  ratingBreakdown: RatingBreakdown;
}) {
  const list = reviews ?? [];
  const breakdownMap = new Map(ratingBreakdown.map(item => [item.star, item]));

  return (
    <div className='space-y-6'>
      <FadeIn>
        <section className='grid gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-[180px_1fr] sm:p-6'>
          <div className='flex flex-col items-center justify-center rounded-2xl bg-white p-5 text-center shadow-sm'>
            <span className='text-5xl font-black tracking-tight text-[#074079]'>{ratingAverage.toFixed(1)}</span>
            <div className='mt-2 flex items-center gap-0.5'>
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.round(ratingAverage) ? "fill-orange-400 text-orange-400" : "text-slate-300"}`}
                />
              ))}
            </div>
            <span className='mt-2 text-xs font-medium text-slate-500'>{list.length} review{list.length === 1 ? "" : "s"}</span>
          </div>

          <div className='space-y-2.5'>
            {[5, 4, 3, 2, 1].map(star => {
              const data = breakdownMap.get(star);
              const percentage = Number.parseFloat(data?.percentage ?? "0") || 0;
              return (
                <div key={star} className='grid grid-cols-[42px_1fr_46px] items-center gap-3'>
                  <span className='flex items-center gap-1 text-xs font-semibold text-slate-600'>
                    {star} <Star className='h-3 w-3 fill-orange-400 text-orange-400' />
                  </span>
                  <div className='h-2 overflow-hidden rounded-full bg-slate-200'>
                    <div className='h-full rounded-full bg-orange-500 transition-all' style={{ width: `${Math.min(100, percentage)}%` }} />
                  </div>
                  <span className='text-right text-xs text-slate-500'>{Math.round(percentage)}%</span>
                </div>
              );
            })}
          </div>
        </section>
      </FadeIn>

      <section>
        <div className='mb-4 flex items-center justify-between gap-4'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.18em] text-orange-500'>Student feedback</p>
            <h2 className='mt-1 text-xl font-bold text-slate-900'>Course reviews</h2>
          </div>
          <span className='rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600'>{list.length} total</span>
        </div>

        {list.length === 0 ? (
          <div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center'>
            <MessageSquareText className='mx-auto h-9 w-9 text-slate-400' />
            <h3 className='mt-3 font-bold text-slate-800'>No reviews yet</h3>
            <p className='mt-1 text-sm text-slate-500'>Student feedback will appear here.</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {list.map((review, index) => (
              <FadeIn key={`${review.userDisplayName}-${review.createdAt}-${index}`} delay={index * 60}>
                <article className='rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-orange-200 hover:shadow-sm sm:p-5'>
                  <div className='flex items-start gap-3.5'>
                    <div className='relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200'>
                      <Image
                        src={review.avatarUrl || "/default-avatar.png"}
                        alt={review.userDisplayName || "Student"}
                        fill
                        sizes='44px'
                        className='object-cover'
                      />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                        <h3 className='truncate text-sm font-bold text-slate-900'>{review.userDisplayName || "Student"}</h3>
                        <time className='text-xs text-slate-400'>{new Date(review.createdAt).toLocaleDateString()}</time>
                      </div>
                      <div className='mt-1.5 flex items-center gap-0.5'>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${star <= review.rating ? "fill-orange-400 text-orange-400" : "text-slate-300"}`}
                          />
                        ))}
                      </div>
                      {review.body && <p className='mt-3 text-sm leading-6 text-slate-600'>{review.body}</p>}
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ReviewsTab;
