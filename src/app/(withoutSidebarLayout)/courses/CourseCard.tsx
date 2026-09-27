"use client";

import {
  BookOpen,
  Check,
  Clock,
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
import { useSessionContext } from "@/app/contexts/SessionContext";
import type { CourseCardProps, CourseStatus } from "./allCourses.types.ts";

const formatPrice = (value: number) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

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
}: CourseCardProps) {
  const { user: sessionUser } = useSessionContext();

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
    lessonProgress,
    ratingAverage,
    courseInstructors,
  } = course;

  const activeUser = user ?? sessionUser;
  const ownerUserId = createdBy?.userId ?? createdBy?.user?.id;
  const isCourseInstructor = Boolean(
    activeUser?.id && courseInstructors?.some(instructor => instructor.userId === activeUser.id)
  );
  const ownsCourse = Boolean(
    isOwner ||
      (activeUser?.id && ownerUserId && activeUser.id === ownerUserId) ||
      isCourseInstructor
  );

  const hasProgress = Boolean(lessonProgress?.length);
  const overallProgress = hasProgress
    ? Math.round(
        lessonProgress.reduce((acc, curr) => acc + Number(curr.progressValue ?? 0), 0) /
          lessonProgress.length
      )
    : 0;

  const lessons = (modules ?? []).reduce(
    (acc, module) => acc + Number(module._count?.lessons ?? 0),
    0
  );

  const totalSeconds = (modules ?? []).reduce((total, module) => {
    const moduleTotal = (module.lessons ?? []).reduce(
      (sum, lesson) => sum + Number(lesson.duration ?? 0),
      0
    );
    return total + moduleTotal;
  }, 0);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const totalDurationInFormatted = `${hours}:${minutes.toString().padStart(2, "0")} hrs`;

  const regularPrice = Number(originalPrice ?? 0);
  const price = discountPrice !== null && Number(discountPrice) >= 0
    ? Number(discountPrice)
    : regularPrice;

  const instructor = {
    name: createdBy?.displayName ?? "AloSkill Instructor",
    avatar: createdBy?.avatarUrl ?? createdBy?.user?.avatarUrl ?? null,
  };

  const rating = Number(ratingAverage ?? 0);
  const reviewCount = Number(_count?.reviews ?? 0);
  const students = Number(_count?.enrollments ?? 0);
  const enrolled =
    typeof isEnrolled === "boolean"
      ? isEnrolled
      : Boolean(
          activeUser?.id &&
            course.enrollments?.some(enrollment => enrollment.userId === activeUser.id)
        );

  const [imgSrc, setImgSrc] = useState(thumbnailUrl || "/images/course-placeholder.png");
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleWishlistToggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!onAddToWishlist || isWishlistLoading || ownsCourse) return;

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
    if (ownsCourse || enrolled) return;
    onAddToCart?.(id);
  };

  const discountPercentage =
    regularPrice > price && regularPrice > 0
      ? Math.round(((regularPrice - price) / regularPrice) * 100)
      : 0;

  const STATUS_CONFIG: Record<CourseStatus, { label: string; className: string }> = {
    DRAFT: {
      label: "Draft",
      className: "bg-gray-200 text-gray-700",
    },
    PUBLISHED: {
      label: "Published",
      className: "bg-green-100 text-green-700",
    },
    PENDING: {
      label: "Pending",
      className: "bg-amber-100 text-amber-700",
    },
  };

  const statusConfig = STATUS_CONFIG[status as CourseStatus] ?? STATUS_CONFIG.DRAFT;

  return (
    <article className='group flex h-full flex-col overflow-hidden rounded-md border-2 border-dotted border-orange-400 bg-white shadow-md transition-all duration-300 hover:shadow-2xl'>
      <div className='relative h-48 bg-gray-200'>
        <Link
          href={`/courses/${id}`}
          className='absolute inset-0 z-0'
          aria-label={title}
        >
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
            className='object-cover transition-transform duration-500 group-hover:scale-110'
            onError={() => {
              if (imgSrc !== "/images/course-placeholder.png") {
                setImgSrc("/images/course-placeholder.png");
              }
            }}
          />
          <div className='absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-black/10' />
        </Link>

        {dashboardActions && (
          <div className='absolute right-3 top-3 z-30'>
            <button
              type='button'
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                setShowMenu(prev => !prev);
              }}
              className='flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-100'
              aria-label='Course actions'
            >
              <MoreVertical className='h-4 w-4 text-gray-600' />
            </button>

            {showMenu && (
              <div
                className='absolute right-0 mt-2 w-48 rounded-lg border bg-white py-2 shadow-xl'
                onClick={event => event.stopPropagation()}
              >
                {dashboardActions.onView && (
                  <button
                    type='button'
                    onClick={() => dashboardActions.onView?.(id)}
                    className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50'
                  >
                    <Eye className='h-4 w-4' />
                    View Details
                  </button>
                )}

                {dashboardActions.onEdit && (
                  <button
                    type='button'
                    onClick={() => dashboardActions.onEdit?.(id)}
                    className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50'
                  >
                    <Edit className='h-4 w-4' />
                    Edit Course
                  </button>
                )}

                {dashboardActions.onDelete && (
                  <button
                    type='button'
                    onClick={() => dashboardActions.onDelete?.(id)}
                    className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50'
                  >
                    <Trash2 className='h-4 w-4' />
                    Delete Course
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {category?.name && (
          <div className='absolute left-4 top-4 z-10 max-w-[62%]'>
            <span className='block truncate rounded-xl bg-black/45 px-2.5 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm'>
              {category.name}
            </span>
          </div>
        )}

        {!dashboardActions && (
          <div className='absolute right-4 top-4 z-10 rounded bg-white px-3 py-1.5 shadow-lg'>
            <div className='flex items-center gap-1.5'>
              {price <= 0 ? (
                <span className='text-base font-black text-green-600'>Free</span>
              ) : (
                <>
                  <span className='text-base font-black text-orange-600'>{formatPrice(price)}</span>
                  {regularPrice > price && (
                    <span className='text-sm text-gray-400 line-through'>{formatPrice(regularPrice)}</span>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {discountPercentage > 0 && !dashboardActions && (
          <div className='absolute bottom-4 right-4 z-10 rounded bg-red-500 px-2 py-1 text-sm font-bold text-white shadow-lg'>
            {discountPercentage}% OFF
          </div>
        )}

        {!dashboardActions && !ownsCourse && onAddToWishlist && (
          <button
            type='button'
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            className={`absolute bottom-4 left-4 z-10 rounded-full p-2 backdrop-blur-sm transition-all duration-300 ${
              isInWishlist
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white"
            } ${isWishlistLoading ? "cursor-not-allowed opacity-50" : ""}`}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-4 w-4 transition-all ${isInWishlist ? "fill-current" : ""}`} />
          </button>
        )}
      </div>

      <div className='flex grow flex-col p-5'>
        {hasProgress && (
          <div className='mb-4'>
            <div className='mb-1 flex items-end justify-between'>
              <span className='text-xs font-bold uppercase tracking-wider text-orange-600'>
                Progress
              </span>
              <span className='text-xs font-medium text-gray-600'>{overallProgress}%</span>
            </div>
            <div className='h-2 w-full rounded-full bg-gray-200'>
              <div
                className='h-2 rounded-full bg-orange-500 transition-all duration-500'
                style={{ width: `${Math.min(100, Math.max(0, overallProgress))}%` }}
              />
            </div>
          </div>
        )}

        <div className='mb-3 flex items-center justify-between gap-2'>
          <div className='flex items-center gap-1'>
            <div className='flex items-center' aria-label={`Rating: ${rating} out of 5`}>
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${
                    index < Math.round(rating)
                      ? "fill-orange-400 text-orange-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className='text-sm font-semibold text-gray-900'>{rating.toFixed(1)}</span>
            <span className='text-sm text-gray-500'>({reviewCount})</span>
          </div>

          {dashboardActions && (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.className}`}>
              {statusConfig.label}
            </span>
          )}
        </div>

        <Link href={`/courses/${id}`}>
          <h3 className='mb-4 min-h-14 line-clamp-2 cursor-pointer text-lg font-semibold text-gray-900 transition-colors group-hover:text-orange-600'>
            {title}
          </h3>
        </Link>

        <div className='mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-600'>
          <div className='flex items-center gap-1' title={`${lessons} lessons`}>
            <BookOpen className='h-4 w-4 shrink-0 text-orange-600' />
            <span className='whitespace-nowrap'>{lessons} Lessons</span>
          </div>
          <div className='flex items-center gap-1' title={`Duration: ${totalDurationInFormatted}`}>
            <Clock className='h-4 w-4 shrink-0 text-orange-600' />
            <span className='whitespace-nowrap'>{totalDurationInFormatted}</span>
          </div>
          <div className='flex items-center gap-1' title={`${students} students enrolled`}>
            <Users className='h-4 w-4 shrink-0 text-orange-600' />
            <span className='whitespace-nowrap'>{students}</span>
          </div>
        </div>

        <div className='mt-auto border-t border-gray-100 pt-4'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex min-w-0 items-center gap-2'>
              <div className='relative h-8 w-8 shrink-0'>
                {instructor.avatar ? (
                  <Image
                    src={instructor.avatar}
                    alt={instructor.name}
                    fill
                    sizes='32px'
                    className='rounded-full object-cover'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center rounded-full bg-orange-200'>
                    <Users className='h-4 w-4 text-orange-600' />
                  </div>
                )}
              </div>
              <span className='truncate text-sm font-medium text-gray-700'>{instructor.name}</span>
            </div>

            {!dashboardActions && (
              <div className='flex shrink-0 items-center gap-2'>
                {ownsCourse ? (
                  <span className='inline-flex items-center gap-1.5 rounded bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600'>
                    <GraduationCap className='h-4 w-4' /> Your Course
                  </span>
                ) : enrolled ? (
                  <Link
                    href={`/watch-video/${id}`}
                    className='inline-flex items-center gap-1.5 rounded bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-700 hover:shadow-lg'
                  >
                    <Check className='h-4 w-4' /> Continue
                  </Link>
                ) : (
                  <>
                    {onAddToCart && (
                      <button
                        type='button'
                        onClick={handleAddToCart}
                        disabled={isInCart}
                        className={`rounded p-2 transition-all ${
                          isInCart
                            ? "cursor-default bg-green-100 text-green-600"
                            : "cursor-pointer bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                        }`}
                        title={isInCart ? "In cart" : "Add to cart"}
                      >
                        {isInCart ? (
                          <Check className='h-4 w-4' />
                        ) : (
                          <ShoppingCart className='h-4 w-4' />
                        )}
                      </button>
                    )}

                    <Link
                      href={`/checkout?courseId=${id}`}
                      className='whitespace-nowrap rounded bg-linear-to-r from-orange-500 to-orange-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-lg'
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
