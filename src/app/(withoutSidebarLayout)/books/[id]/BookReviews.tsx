"use client";

import { BadgeCheck, Loader2, MessageSquareText, Pencil, Star, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { apiClient } from "../../../../lib/api/client";
import { useSessionContext } from "../../../contexts/SessionContext";
import type {
  BookReview,
  BookReviewsResponse,
  BookReviewStatusResponse,
  SubmitBookReviewResponse,
} from "../Books.type";

interface BookReviewsProps {
  bookId: string;
  initialRating: number;
  initialReviewCount: number;
  onSummaryChange?: (summary: { average: number; count: number }) => void;
}

function RatingStars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const iconClass = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div
      className='flex items-center gap-0.5'
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index + 1 <= Math.round(rating);
        return (
          <Star
            key={index}
            className={`${iconClass} ${
              filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300"
            }`}
            aria-hidden='true'
          />
        );
      })}
    </div>
  );
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BookReviews({
  bookId,
  initialRating,
  initialReviewCount,
  onSummaryChange,
}: BookReviewsProps) {
  const { isAuthenticated, isLoading: isSessionLoading } = useSessionContext();

  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [summary, setSummary] = useState({
    average: Number(initialRating || 0),
    count: Number(initialReviewCount || 0),
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const [reviewStatus, setReviewStatus] = useState<BookReviewStatusResponse | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const existingReview = reviewStatus?.existingReview ?? null;
  const isEditing = Boolean(existingReview);

  const fetchReviews = useCallback(
    async (requestedPage = 1, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsReviewsLoading(true);
      }

      setReviewsError("");

      const response = await apiClient.get<BookReviewsResponse>(
        `/book/public/book-details/${bookId}/reviews?page=${requestedPage}&limit=6`
      );

      if (!response.success || !response.data) {
        setReviewsError(response.message || "Unable to load reviews right now.");
        setIsReviewsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      setReviews(previous =>
        append ? [...previous, ...response.data!.items] : response.data!.items
      );
      setSummary(response.data.summary);
      onSummaryChange?.(response.data.summary);
      setPage(response.data.pagination.page);
      setHasMore(response.data.pagination.hasMore);
      setIsReviewsLoading(false);
      setIsLoadingMore(false);
    },
    [bookId, onSummaryChange]
  );

  const fetchReviewStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setReviewStatus(null);
      return;
    }

    setIsStatusLoading(true);

    const response = await apiClient.get<BookReviewStatusResponse>(
      `/book/user/books/${bookId}/review-status`
    );

    if (response.success && response.data) {
      setReviewStatus(response.data);
    } else {
      setReviewStatus(null);
    }

    setIsStatusLoading(false);
  }, [bookId, isAuthenticated]);

  useEffect(() => {
    void fetchReviews(1, false);
  }, [fetchReviews]);

  useEffect(() => {
    if (!isSessionLoading) {
      void fetchReviewStatus();
    }
  }, [fetchReviewStatus, isSessionLoading]);

  useEffect(() => {
    if (!existingReview) {
      setRating(0);
      setTitle("");
      setBody("");
      return;
    }

    setRating(existingReview.rating);
    setTitle(existingReview.title ?? "");
    setBody(existingReview.body ?? "");
  }, [existingReview]);

  const ratingLabel = useMemo(() => {
    const labels = ["Select a rating", "Poor", "Fair", "Good", "Very good", "Excellent"];
    return labels[hoveredRating || rating] ?? labels[0];
  }, [hoveredRating, rating]);

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (rating < 1 || rating > 5) {
      setFormError("Please select a star rating.");
      return;
    }

    const cleanBody = body.trim();
    if (cleanBody.length < 5) {
      setFormError("Please write at least 5 characters about the book.");
      return;
    }

    setIsSubmitting(true);

    const response = await apiClient.post<SubmitBookReviewResponse>(
      `/book/user/books/${bookId}/reviews`,
      {
        rating,
        title: title.trim(),
        body: cleanBody,
      }
    );

    if (!response.success || !response.data) {
      setFormError(response.message || "Unable to save your review.");
      setIsSubmitting(false);
      return;
    }

    setSummary(response.data.summary);
    onSummaryChange?.(response.data.summary);
    setFormSuccess(
      response.data.updated ? "Your review has been updated." : "Your review has been published."
    );
    setIsSubmitting(false);

    await Promise.all([fetchReviews(1, false), fetchReviewStatus()]);
  };

  return (
    <section className='border-t border-slate-200/80 bg-slate-50/60'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='mb-1.5 text-sm font-bold uppercase tracking-[0.2em] text-orange-500'>
              Reader Feedback
            </p>
            <h2 className='text-2xl font-black tracking-tight text-slate-900'>Book Reviews</h2>
          </div>

          <div className='flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm'>
            <div className='text-3xl font-black text-slate-900'>{summary.average.toFixed(1)}</div>
            <div>
              <RatingStars rating={summary.average} />
              <p className='mt-1 text-xs font-medium text-slate-500'>
                {summary.count} {summary.count === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        </div>

        <div className='grid gap-8 lg:grid-cols-[360px_1fr]'>
          <aside className='h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-8'>
            <div className='mb-5 flex items-center gap-2'>
              <MessageSquareText className='h-5 w-5 text-orange-500' />
              <h3 className='font-black text-slate-900'>
                {isEditing ? "Update your review" : "Write a review"}
              </h3>
            </div>

            {isSessionLoading || isStatusLoading ? (
              <div className='flex min-h-36 items-center justify-center text-slate-500'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Checking review access...
              </div>
            ) : !isAuthenticated ? (
              <div className='rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600'>
                Please{" "}
                <Link
                  href='/auth/signin'
                  className='font-bold text-orange-600 hover:underline'
                >
                  sign in
                </Link>{" "}
                to review this book. Reviews are available to verified purchasers.
              </div>
            ) : !reviewStatus?.canReview ? (
              <div className='rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800'>
                You can review this book after purchasing it from AloSkill.
              </div>
            ) : (
              <form
                onSubmit={submitReview}
                className='space-y-4'
              >
                <div>
                  <p className='mb-2 text-sm font-bold text-slate-700'>Your rating</p>
                  <div className='flex items-center gap-2'>
                    <div
                      className='flex items-center gap-1'
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = index + 1;
                        const active = value <= (hoveredRating || rating);

                        return (
                          <button
                            key={value}
                            type='button'
                            onClick={() => setRating(value)}
                            onMouseEnter={() => setHoveredRating(value)}
                            className='rounded-md p-0.5 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-300'
                            aria-label={`${value} star${value === 1 ? "" : "s"}`}
                          >
                            <Star
                              className={`h-7 w-7 ${
                                active
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-transparent text-slate-300"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className='text-xs font-semibold text-slate-500'>{ratingLabel}</span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor='book-review-title'
                    className='mb-1.5 block text-sm font-bold text-slate-700'
                  >
                    Review title <span className='font-normal text-slate-400'>(optional)</span>
                  </label>
                  <input
                    id='book-review-title'
                    value={title}
                    onChange={event => setTitle(event.target.value)}
                    maxLength={120}
                    placeholder='A short headline'
                    className='w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100'
                  />
                </div>

                <div>
                  <label
                    htmlFor='book-review-body'
                    className='mb-1.5 block text-sm font-bold text-slate-700'
                  >
                    Your review
                  </label>
                  <textarea
                    id='book-review-body'
                    value={body}
                    onChange={event => setBody(event.target.value)}
                    minLength={5}
                    maxLength={2000}
                    rows={5}
                    required
                    placeholder='What did you like about this book?'
                    className='w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100'
                  />
                  <div className='mt-1 flex justify-between text-xs text-slate-400'>
                    <span>Be specific and helpful to other readers.</span>
                    <span>{body.length}/2000</span>
                  </div>
                </div>

                {formError && (
                  <p className='rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600'>
                    {formError}
                  </p>
                )}

                {formSuccess && (
                  <p className='rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700'>
                    {formSuccess}
                  </p>
                )}

                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Saving review...
                    </>
                  ) : isEditing ? (
                    <>
                      <Pencil className='h-4 w-4' />
                      Update review
                    </>
                  ) : (
                    <>
                      <MessageSquareText className='h-4 w-4' />
                      Publish review
                    </>
                  )}
                </button>
              </form>
            )}
          </aside>

          <div>
            {isReviewsLoading ? (
              <div className='flex min-h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500'>
                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                Loading reviews...
              </div>
            ) : reviewsError ? (
              <div className='rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600'>
                {reviewsError}
              </div>
            ) : reviews.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center'>
                <MessageSquareText className='mx-auto h-8 w-8 text-slate-300' />
                <h3 className='mt-3 font-bold text-slate-800'>No reviews yet</h3>
                <p className='mt-1 text-sm text-slate-500'>
                  Be the first verified buyer to review this book.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {reviews.map(review => (
                  <article
                    key={review.id}
                    className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'
                  >
                    <div className='flex items-start gap-3'>
                      <div className='relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50'>
                        {review.reviewer.avatarUrl ? (
                          <Image
                            src={review.reviewer.avatarUrl}
                            alt={review.reviewer.displayName}
                            fill
                            sizes='44px'
                            className='object-cover'
                          />
                        ) : (
                          <UserRound className='h-5 w-5 text-orange-500' />
                        )}
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                          <div>
                            <p className='font-bold text-slate-900'>
                              {review.reviewer.displayName}
                            </p>
                            {review.verifiedPurchase && (
                              <span className='mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600'>
                                <BadgeCheck className='h-3.5 w-3.5' />
                                Verified purchase
                              </span>
                            )}
                          </div>
                          <time className='text-xs font-medium text-slate-400'>
                            {formatReviewDate(review.createdAt)}
                          </time>
                        </div>

                        <div className='mt-3 flex items-center gap-2'>
                          <RatingStars rating={review.rating} />
                          <span className='text-xs font-bold text-slate-500'>
                            {review.rating}.0
                          </span>
                        </div>

                        {review.title && (
                          <h4 className='mt-3 font-bold text-slate-900'>{review.title}</h4>
                        )}
                        {review.body && (
                          <p className='mt-2 whitespace-pre-line text-sm leading-6 text-slate-600'>
                            {review.body}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}

                {hasMore && (
                  <div className='pt-2 text-center'>
                    <button
                      type='button'
                      disabled={isLoadingMore}
                      onClick={() => void fetchReviews(page + 1, true)}
                      className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:text-orange-600 disabled:opacity-60'
                    >
                      {isLoadingMore && <Loader2 className='h-4 w-4 animate-spin' />}
                      {isLoadingMore ? "Loading..." : "Load more reviews"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
