"use client";

import {
  BookOpen,
  Check,
  Clock3,
  Edit,
  Eye,
  GraduationCap,
  Heart,
  MoreVertical,
  ShoppingCart,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useState } from "react";
import type { CourseCardProps, CourseStatus } from "./allCourses.types.ts";

const formatPrice = (value: number) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

const formatDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return safeSeconds > 0 ? "< 1m" : "0m";
};

const CourseCard = memo(function CourseCard({
  course,
  onAddToCart,
  onAddToWishlist,
  isInCart = false,
  isInWishlist = false,
  dashboardActions,
  isEnrolled,
  isOwner,
  user,
  viewMode = "grid",
}: CourseCardProps) {
  const {
    id,
    title,
    thumbnailUrl,
    createdBy,
    category,
    modules,
    _count,
    originalPrice,
    discountPrice,
    status,
    ratingAverage,
    lessonProgress,
    level,
    language,
  } = course;

  const lessons = modules.reduce((sum, module) => sum + Number(module._count?.lessons ?? 0), 0);
  const totalSeconds = modules.reduce(
    (total, module) =>
      total + module.lessons.reduce((sum, lesson) => sum + Number(lesson.duration ?? 0), 0),
    0
  );

  const hasProgress = Boolean(lessonProgress?.length);
  const overallProgress =
    hasProgress && lessons > 0
      ? Math.min(
          100,
          Math.round(
            lessonProgress.reduce(
              (sum, progress) => sum + Math.min(100, Number(progress.progressValue ?? 0)),
              0
            ) / lessons
          )
        )
      : 0;

  const price = discountPrice !== null ? Number(discountPrice) : Number(originalPrice ?? 0);
  const rating = Number(ratingAverage ?? 0);
  const reviewCount = Number(_count?.reviews ?? 0);
  const students = Number(_count?.enrollments ?? 0);
  const enrolled =
    typeof isEnrolled === "boolean"
      ? isEnrolled
      : Boolean(user?.id && course.enrollments?.some(enrollment => enrollment.userId === user.id));

  const instructor = {
    name: createdBy?.displayName ?? "AloSkill Instructor",
    avatar: createdBy?.avatarUrl ?? null,
  };

  const discountPercentage =
    Number(originalPrice ?? 0) > price
      ? Math.round(((Number(originalPrice) - price) / Number(originalPrice)) * 100)
      : 0;

  const [imgSrc, setImgSrc] = useState(thumbnailUrl || "/images/course-placeholder.png");
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleWishlistToggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!onAddToWishlist || isWishlistLoading) return;

    try {
      setIsWishlistLoading(true);
      await onAddToWishlist(id);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onAddToCart?.(id);
  };

  const STATUS_CONFIG: Record<CourseStatus, { label: string; className: string }> = {
    DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-700" },
    PUBLISHED: { label: "Published", className: "bg-emerald-50 text-emerald-700" },
    PENDING: { label: "Pending approval", className: "bg-amber-50 text-amber-700" },
  };
  const statusConfig = STATUS_CONFIG[status as CourseStatus] ?? STATUS_CONFIG.DRAFT;

  const isList = viewMode === "list" && !dashboardActions;

  return (
    <article
      className={`group overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-900/10 ${
        isList ? "flex flex-col sm:flex-row" : "flex h-full flex-col"
      }`}
    >
      <div
        className={`relative overflow-hidden bg-slate-100 ${
          isList ? "aspect-video sm:min-h-[260px] sm:w-[310px] sm:shrink-0" : "aspect-[16/10]"
        }`}
      >
        <Link href={`/courses/${id}`} className='absolute inset-0' aria-label={title}>
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes={isList ? "(max-width: 640px) 100vw, 310px" : "(max-width: 768px) 100vw, 33vw"}
            className='object-cover transition-transform duration-500 group-hover:scale-[1.04]'
            onError={() => {
              if (imgSrc !== "/images/course-placeholder.png") {
                setImgSrc("/images/course-placeholder.png");
              }
            }}
          />
          <div className='absolute inset-0 bg-linear-to-t from-slate-950/45 via-transparent to-transparent' />
        </Link>

        {category?.name && (
          <span className='absolute left-4 top-4 z-10 max-w-[70%] truncate rounded-full border border-white/25 bg-slate-950/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md'>
            {category.name}
          </span>
        )}

        {discountPercentage > 0 && !dashboardActions && (
          <span className='absolute bottom-4 right-4 z-10 rounded-full bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg'>
            {discountPercentage}% OFF
          </span>
        )}

        {!dashboardActions && onAddToWishlist && (
          <button
            type='button'
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            className={`absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/30 shadow-lg backdrop-blur-md transition ${
              isInWishlist
                ? "bg-rose-500 text-white"
                : "bg-white/90 text-slate-700 hover:bg-rose-500 hover:text-white"
            } ${isWishlistLoading ? "cursor-wait opacity-70" : ""}`}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
          </button>
        )}

        {dashboardActions && (
          <div className='absolute right-3 top-3 z-20'>
            <button
              type='button'
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                setShowMenu(prev => !prev);
              }}
              className='grid h-9 w-9 place-items-center rounded-full bg-white text-slate-600 shadow-lg transition hover:bg-slate-50'
              aria-label='Course actions'
            >
              <MoreVertical className='h-4 w-4' />
            </button>

            {showMenu && (
              <div
                className='absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl'
                onClick={event => event.stopPropagation()}
              >
                {dashboardActions.onView && (
                  <button
                    type='button'
                    onClick={() => dashboardActions.onView?.(id)}
                    className='flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50'
                  >
                    <Eye className='h-4 w-4 text-orange-600' /> View Details
                  </button>
                )}
                {dashboardActions.onEdit && (
                  <button
                    type='button'
                    onClick={() => dashboardActions.onEdit?.(id)}
                    className='flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50'
                  >
                    <Edit className='h-4 w-4' /> Edit Course
                  </button>
                )}
                {dashboardActions.onDelete && (
                  <button
                    type='button'
                    onClick={() => dashboardActions.onDelete?.(id)}
                    className='flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50'
                  >
                    <Trash2 className='h-4 w-4' /> Delete Course
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${isList ? "p-5 sm:p-6" : "p-5"}`}>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
          <div className='flex items-center gap-2 text-xs font-semibold text-slate-500'>
            <span className='rounded-full bg-blue-50 px-2.5 py-1 text-[#074079]'>
              {level ? level.charAt(0) + level.slice(1).toLowerCase() : "All levels"}
            </span>
            {language && (
              <span className='rounded-full bg-slate-100 px-2.5 py-1'>
                {language.charAt(0) + language.slice(1).toLowerCase()}
              </span>
            )}
          </div>

          {dashboardActions && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}>
              {statusConfig.label}
            </span>
          )}
        </div>

        <Link href={`/courses/${id}`}>
          <h3
            className={`font-bold leading-snug text-slate-900 transition group-hover:text-orange-600 ${
              isList ? "text-xl sm:text-2xl" : "min-h-[52px] text-lg"
            }`}
          >
            {title}
          </h3>
        </Link>

        <div className='mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500'>
          <div className='flex items-center gap-1.5'>
            <Star className='h-4 w-4 fill-orange-400 text-orange-400' />
            <span className='font-bold text-slate-800'>{rating.toFixed(1)}</span>
            <span>({reviewCount})</span>
          </div>
          <span className='hidden h-1 w-1 rounded-full bg-slate-300 sm:block' />
          <div className='flex items-center gap-1.5'>
            <Users className='h-4 w-4 text-slate-400' />
            <span>{students.toLocaleString()} students</span>
          </div>
        </div>

        {hasProgress && (
          <div className='mt-4'>
            <div className='mb-1.5 flex items-center justify-between text-xs font-semibold'>
              <span className='text-orange-600'>Your progress</span>
              <span className='text-slate-500'>{overallProgress}%</span>
            </div>
            <div className='h-2 overflow-hidden rounded-full bg-slate-100'>
              <div
                className='h-full rounded-full bg-orange-500 transition-all duration-500'
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className={`mt-5 grid gap-2 text-sm text-slate-600 ${isList ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3"}`}>
          <div className='flex items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-2'>
            <BookOpen className='h-4 w-4 shrink-0 text-orange-600' />
            <span className='truncate'>{lessons} lessons</span>
          </div>
          <div className='flex items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-2'>
            <Clock3 className='h-4 w-4 shrink-0 text-orange-600' />
            <span className='truncate'>{formatDuration(totalSeconds)}</span>
          </div>
          <div className='hidden items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-2 sm:flex'>
            <GraduationCap className='h-4 w-4 shrink-0 text-orange-600' />
            <span className='truncate'>Certificate</span>
          </div>
        </div>

        <div className='mt-auto pt-5'>
          <div className='border-t border-slate-100 pt-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex min-w-0 items-center gap-2.5'>
                <div className='relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-orange-100'>
                  {instructor.avatar ? (
                    <Image
                      src={instructor.avatar}
                      alt={instructor.name}
                      fill
                      sizes='36px'
                      className='object-cover'
                    />
                  ) : (
                    <div className='grid h-full w-full place-items-center text-orange-700'>
                      <Users className='h-4 w-4' />
                    </div>
                  )}
                </div>
                <div className='min-w-0'>
                  <p className='text-[11px] font-medium text-slate-400'>Instructor</p>
                  <p className='truncate text-sm font-semibold text-slate-700'>{instructor.name}</p>
                </div>
              </div>

              {!dashboardActions && (
                <div className='text-right'>
                  {price <= 0 ? (
                    <span className='text-lg font-black text-emerald-600'>Free</span>
                  ) : (
                    <div className='flex items-baseline justify-end gap-2'>
                      <span className='text-xl font-black text-[#074079]'>{formatPrice(price)}</span>
                      {Number(originalPrice ?? 0) > price && (
                        <span className='text-xs font-semibold text-slate-400 line-through'>
                          {formatPrice(Number(originalPrice))}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isOwner && !dashboardActions && (
              <div className='mt-4 flex gap-2'>
                {enrolled ? (
                  <Link
                    href={`/watch-video/${id}`}
                    className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#074079] px-4 text-sm font-semibold text-white transition hover:bg-[#063461]'
                  >
                    <Check className='h-4 w-4' /> Continue Learning
                  </Link>
                ) : (
                  <>
                    {onAddToCart && (
                      <button
                        type='button'
                        onClick={handleAddToCart}
                        disabled={isInCart}
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition ${
                          isInCart
                            ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                        title={isInCart ? "Already in cart" : "Add to cart"}
                      >
                        {isInCart ? <Check className='h-4 w-4' /> : <ShoppingCart className='h-4 w-4' />}
                      </button>
                    )}

                    <Link
                      href={`/checkout?courseId=${id}`}
                      className='inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white shadow-lg shadow-orange-600/15 transition hover:bg-orange-700'
                    >
                      Enroll Now
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

export default CourseCard;
