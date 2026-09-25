"use client";

import { BookOpen, Check, Clock3, Heart, ShoppingCart, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CourseType } from "./allCourses.types.ts";

interface CourseListingCardProps {
  course: CourseType;
  index?: number;
  isInCart?: boolean;
  isInWishlist?: boolean;
  isEnrolled?: boolean;
  onAddToCart?: (courseId: string) => void;
  onAddToWishlist?: (courseId: string) => Promise<void> | void;
}

const formatMoney = (value: number) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

const formatDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  if (minutes) return `${minutes}m`;
  return safeSeconds > 0 ? "< 1m" : "0m";
};

export default function CourseListingCard({
  course,
  index = 0,
  isInCart = false,
  isInWishlist = false,
  isEnrolled = false,
  onAddToCart,
  onAddToWishlist,
}: CourseListingCardProps) {
  const [imageSrc, setImageSrc] = useState(course.thumbnailUrl || "/images/course-placeholder.png");
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const lessons = course.modules.reduce(
    (sum, module) => sum + Number(module._count?.lessons ?? 0),
    0
  );
  const totalSeconds = course.modules.reduce(
    (total, module) =>
      total + module.lessons.reduce((sum, lesson) => sum + Number(lesson.duration ?? 0), 0),
    0
  );

  const originalPrice = Number(course.originalPrice ?? 0);
  const price = course.discountPrice !== null ? Number(course.discountPrice) : originalPrice;
  const discount =
    originalPrice > price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const rating = Number(course.ratingAverage ?? 0);
  const reviews = Number(course._count?.reviews ?? 0);
  const students = Number(course._count?.enrollments ?? 0);
  const instructor = course.createdBy?.displayName || "AloSkill Instructor";

  const toggleWishlist = async () => {
    if (!onAddToWishlist || wishlistLoading) return;
    try {
      setWishlistLoading(true);
      await onAddToWishlist(course.id);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <article className='group flex h-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/70'>
      <div className='relative aspect-[16/10] w-full overflow-hidden bg-stone-50'>
        <Link href={`/courses/${course.id}`} className='absolute inset-0' aria-label={course.title}>
          <Image
            src={imageSrc}
            alt={course.title}
            fill
            priority={index < 4}
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px'
            className='object-cover transition duration-500 ease-out group-hover:scale-[1.025]'
            onError={() => {
              if (imageSrc !== "/images/course-placeholder.png") {
                setImageSrc("/images/course-placeholder.png");
              }
            }}
          />
          <div className='absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent' />
        </Link>

        <div className='pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1.5'>
          {course.category?.name && (
            <span className='max-w-48 truncate rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-gray-700 shadow-sm backdrop-blur-sm'>
              {course.category.name}
            </span>
          )}
          {discount > 0 && (
            <span className='w-fit rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-black text-white shadow-sm'>
              -{discount}%
            </span>
          )}
        </div>

        {onAddToWishlist && (
          <button
            type='button'
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={`absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full border shadow-sm backdrop-blur-sm transition-colors ${
              isInWishlist
                ? "border-rose-200 bg-rose-500 text-white"
                : "border-white/80 bg-white/95 text-gray-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
            } ${wishlistLoading ? "cursor-wait opacity-60" : ""}`}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-3.5 w-3.5 ${isInWishlist ? "fill-current" : ""}`} />
          </button>
        )}
      </div>

      <div className='flex flex-1 flex-col p-4'>
        <Link href={`/courses/${course.id}`}>
          <h2 className='line-clamp-2 min-h-10 text-sm font-bold leading-snug text-gray-900 transition-colors duration-200 group-hover:text-amber-600'>
            {course.title}
          </h2>
        </Link>

        <p className='mt-0.5 truncate text-[11px] text-gray-400'>by {instructor}</p>

        <div className='mt-2.5 flex flex-wrap gap-1.5'>
          {course.level && (
            <span className='rounded-lg border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500'>
              {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
            </span>
          )}
          {course.language && (
            <span className='rounded-lg border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500'>
              {course.language.charAt(0) + course.language.slice(1).toLowerCase()}
            </span>
          )}
        </div>

        <div className='mt-3 flex items-center justify-between gap-3 text-[11px] text-gray-500'>
          <div className='flex min-w-0 items-center gap-1'>
            <Star className='h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400' />
            <span className='font-bold text-gray-800'>{rating.toFixed(1)}</span>
            <span className='truncate'>({reviews})</span>
          </div>
          <div className='flex min-w-0 items-center gap-1'>
            <Users className='h-3.5 w-3.5 shrink-0 text-gray-400' />
            <span className='truncate'>{students.toLocaleString()} students</span>
          </div>
        </div>

        <div className='mt-3 grid grid-cols-2 gap-2'>
          <div className='flex min-w-0 items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-2 text-[11px] text-gray-500'>
            <BookOpen className='h-3.5 w-3.5 shrink-0 text-amber-500' />
            <span className='truncate'>{lessons} lessons</span>
          </div>
          <div className='flex min-w-0 items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-2 text-[11px] text-gray-500'>
            <Clock3 className='h-3.5 w-3.5 shrink-0 text-amber-500' />
            <span className='truncate'>{formatDuration(totalSeconds)}</span>
          </div>
        </div>

        <div className='mt-auto pt-4'>
          <div className='flex items-center justify-between border-t border-gray-100 pt-3'>
            <div className='flex items-baseline gap-1.5'>
              {price <= 0 ? (
                <span className='text-sm font-bold text-emerald-600'>Free</span>
              ) : (
                <>
                  <span className='text-sm font-bold text-gray-900'>{formatMoney(price)}</span>
                  {originalPrice > price && (
                    <span className='text-[11px] text-gray-400 line-through'>
                      {formatMoney(originalPrice)}
                    </span>
                  )}
                </>
              )}
            </div>

            {isEnrolled && (
              <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-100'>
                Enrolled
              </span>
            )}
          </div>

          <div className='mt-3 flex gap-2'>
            {isEnrolled ? (
              <Link
                href={`/watch-video/${course.id}`}
                className='inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-3 text-xs font-semibold text-white transition-colors hover:bg-gray-800'
              >
                <Check className='h-3.5 w-3.5' /> Continue Learning
              </Link>
            ) : (
              <>
                {onAddToCart && (
                  <button
                    type='button'
                    onClick={() => onAddToCart(course.id)}
                    disabled={isInCart}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors ${
                      isInCart
                        ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-600"
                        : "border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
                    }`}
                    aria-label={isInCart ? "Course already in cart" : "Add course to cart"}
                  >
                    {isInCart ? <Check className='h-3.5 w-3.5' /> : <ShoppingCart className='h-3.5 w-3.5' />}
                  </button>
                )}
                <Link
                  href={`/checkout/${course.id}`}
                  className='inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-amber-400 px-3 text-xs font-bold text-gray-900 transition-colors hover:bg-amber-500'
                >
                  Enroll Now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
