"use client";

import { useSessionContext } from "@/app/contexts/SessionContext.tsx";
import { API_ENDPOINTS, apiClient } from "@/lib/api/client.ts";
import { FadeIn } from "@/lib/course/utils.tsx";
import { CheckCircle2, Loader2, MessageSquareText, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { CourseDetailsPublic } from "../../allCourses.types.ts";

type Review = CourseDetailsPublic["reviews"][number];

type ReviewStatus = {
  canReview: boolean;
  hasEnrollment: boolean;
  teachesCourse: boolean;
  reason: string | null;
  existingReview: {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    createdAt: string;
    flagged: boolean;
  } | null;
};

type SubmitReviewResponse = {
  review: Review & { courseId?: string | null; courseTitle?: string | null };
  summary: { average: number; count: number };
  updated: boolean;
};

function ReviewsTab({
  courseId,
  reviews,
  ratingAverage,
  onReviewSaved,
}: {
  courseId: string;
  reviews: Review[] | undefined;
  ratingAverage: number;
  onReviewSaved?: (payload: SubmitReviewResponse) => void;
}) {
  const { user } = useSessionContext();
  const [list, setList] = useState<Review[]>(reviews ?? []);
  const [average, setAverage] = useState(ratingAverage);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setList(reviews ?? []);
    setAverage(ratingAverage);
  }, [reviews, ratingAverage]);

  useEffect(() => {
    if (!user?.id || !courseId) {
      setReviewStatus(null);
      return;
    }

    let cancelled = false;
    const loadStatus = async () => {
      try {
        setStatusLoading(true);
        const response = await apiClient.get<ReviewStatus>(API_ENDPOINTS.COURSE.REVIEW_STATUS(courseId));
        if (cancelled) return;

        if (response.success && response.data) {
          setReviewStatus(response.data);
          if (response.data.existingReview) {
            setRating(response.data.existingReview.rating);
            setTitle(response.data.existingReview.title ?? "");
            setBody(response.data.existingReview.body ?? "");
          }
        } else {
          setReviewStatus(null);
        }
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    };

    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, [courseId, user?.id]);

  const distribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map(star => {
      const count = list.filter(review => review.rating === star).length;
      return {
        star,
        count,
        percentage: list.length > 0 ? Math.round((count / list.length) * 100) : 0,
      };
    });
  }, [list]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reviewStatus?.canReview || submitting) return;

    const trimmedBody = body.trim();
    if (trimmedBody.length < 5) {
      setMessage({ type: "error", text: "Please write at least 5 characters about your experience." });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      const response = await apiClient.post<SubmitReviewResponse>(API_ENDPOINTS.COURSE.SUBMIT_REVIEW(courseId), {
        rating,
        title: title.trim(),
        body: trimmedBody,
      });

      if (!response.success || !response.data) {
        setMessage({ type: "error", text: response.message || "Unable to save your review." });
        return;
      }

      const payload = response.data;
      setList(current => {
        const existingIndex = current.findIndex(item => item.id === payload.review.id);
        if (existingIndex === -1) return [payload.review, ...current];
        return current.map(item => (item.id === payload.review.id ? payload.review : item));
      });
      setAverage(payload.summary.average);
      setReviewStatus(current =>
        current
          ? {
              ...current,
              existingReview: {
                id: payload.review.id,
                rating: payload.review.rating,
                title: payload.review.title,
                body: payload.review.body,
                createdAt: payload.review.createdAt,
                flagged: current.existingReview?.flagged ?? false,
              },
            }
          : current
      );
      setMessage({
        type: "success",
        text: payload.updated ? "Your review has been updated." : "Thanks! Your review has been published.",
      });
      onReviewSaved?.(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <FadeIn>
        <section className='grid gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-[180px_1fr] sm:p-6'>
          <div className='flex flex-col items-center justify-center rounded-2xl bg-white p-5 text-center shadow-sm'>
            <span className='text-5xl font-black tracking-tight text-[#074079]'>{average.toFixed(1)}</span>
            <div className='mt-2 flex items-center gap-0.5'>
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.round(average) ? "fill-orange-400 text-orange-400" : "text-slate-300"}`}
                />
              ))}
            </div>
            <span className='mt-2 text-xs font-medium text-slate-500'>
              {list.length} review{list.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className='space-y-2.5'>
            {distribution.map(data => (
              <div key={data.star} className='grid grid-cols-[42px_1fr_46px] items-center gap-3'>
                <span className='flex items-center gap-1 text-xs font-semibold text-slate-600'>
                  {data.star} <Star className='h-3 w-3 fill-orange-400 text-orange-400' />
                </span>
                <div className='h-2 overflow-hidden rounded-full bg-slate-200'>
                  <div
                    className='h-full rounded-full bg-orange-500 transition-all'
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
                <span className='text-right text-xs text-slate-500'>{data.percentage}%</span>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      <section className='rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'>
        <div className='mb-4'>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-orange-500'>Your experience</p>
          <h2 className='mt-1 text-xl font-bold text-slate-900'>Review this course</h2>
        </div>

        {!user?.id ? (
          <div className='rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-600'>
            <Link href='/auth/signin' className='font-semibold text-orange-600 hover:underline'>Sign in</Link> after enrolling to leave a verified course review.
          </div>
        ) : statusLoading ? (
          <div className='flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-600'>
            <Loader2 className='h-4 w-4 animate-spin text-orange-500' /> Checking review eligibility...
          </div>
        ) : reviewStatus?.canReview ? (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Your rating</span>
              <div className='flex items-center gap-1'>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type='button'
                    onClick={() => setRating(star)}
                    className='rounded-md p-1 transition hover:scale-110'
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                  >
                    <Star className={`h-7 w-7 ${star <= rating ? "fill-orange-400 text-orange-400" : "text-slate-300"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor='course-review-title' className='mb-1.5 block text-sm font-semibold text-slate-700'>Review title <span className='font-normal text-slate-400'>(optional)</span></label>
              <input
                id='course-review-title'
                value={title}
                onChange={event => setTitle(event.target.value)}
                maxLength={120}
                placeholder='Summarize your experience'
                className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
              />
            </div>

            <div>
              <label htmlFor='course-review-body' className='mb-1.5 block text-sm font-semibold text-slate-700'>Your review</label>
              <textarea
                id='course-review-body'
                value={body}
                onChange={event => setBody(event.target.value)}
                minLength={5}
                maxLength={2000}
                required
                rows={5}
                placeholder='What did you learn? What was most useful?'
                className='w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
              />
              <div className='mt-1 text-right text-xs text-slate-400'>{body.length}/2000</div>
            </div>

            {message && (
              <div className={`rounded-xl px-4 py-3 text-sm font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {message.text}
              </div>
            )}

            <button
              type='submit'
              disabled={submitting}
              className='inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {submitting && <Loader2 className='h-4 w-4 animate-spin' />}
              {reviewStatus.existingReview ? "Update review" : "Submit review"}
            </button>
          </form>
        ) : (
          <div className='rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-600'>
            {reviewStatus?.reason || "Enroll in this course to leave a verified review."}
          </div>
        )}
      </section>

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
            <p className='mt-1 text-sm text-slate-500'>Verified learner feedback will appear here.</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {list.map((review, index) => (
              <FadeIn key={review.id} delay={index * 40}>
                <article className='rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-orange-200 hover:shadow-sm sm:p-5'>
                  <div className='flex items-start gap-3.5'>
                    <div className='relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200'>
                      <Image src={review.avatarUrl || "/default-avatar.png"} alt={review.userDisplayName || "Student"} fill sizes='44px' className='object-cover' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='flex min-w-0 items-center gap-2'>
                          <h3 className='truncate text-sm font-bold text-slate-900'>{review.userDisplayName || "Student"}</h3>
                          {review.verifiedEnrollment && (
                            <span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700'>
                              <CheckCircle2 className='h-3 w-3' /> Verified learner
                            </span>
                          )}
                        </div>
                        <time className='text-xs text-slate-400'>{new Date(review.createdAt).toLocaleDateString()}</time>
                      </div>
                      <div className='mt-1.5 flex items-center gap-0.5'>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? "fill-orange-400 text-orange-400" : "text-slate-300"}`} />
                        ))}
                      </div>
                      {review.title && <h4 className='mt-3 text-sm font-bold text-slate-800'>{review.title}</h4>}
                      {review.body && <p className='mt-2 text-sm leading-6 text-slate-600'>{review.body}</p>}
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
