"use client";

import {
  BookOpen,
  Clock,
  Edit,
  Eye,
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

const CourseCard = memo(function CourseCard({
  course,
  onAddToCart,
  onAddToWishlist,
  isInCart = false,
  isInWishlist = false,
  dashboardActions,
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
  } = course;
  const lessons = modules.reduce((acc, m) => acc + m._count.lessons, 0);

  const totalMinutes = modules
    .flatMap(m => m.lessons)
    .reduce((acc, l) => acc + (l.duration ?? 0), 0);

  const duration = `${Math.ceil(totalMinutes / 60)}h`;

  const price = discountPrice ?? originalPrice;

  const instructor = {
    name: createdBy.displayName ?? "Unknown Instructor",
    avatar: createdBy.avatarUrl,
  };

  const rating = 0;
  const reviewCount = _count.reviews;
  const students = _count.enrollments;

  const [imageError, setImageError] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!onAddToWishlist) return;

    setIsWishlistLoading(true);
    try {
      await onAddToWishlist(id);
    } catch (_error) {
      // console.error("Failed to update wishlist:", error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(id);
  };

  const discountPercentage =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
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
    ARCHIVED: {
      label: "Archived",
      className: "bg-slate-200 text-slate-700",
    },
  };
  return (
    <article className='group bg-white rounded-md shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-dotted border-orange-400 flex flex-col h-full'>
      <div className='relative h-48 bg-gray-200'>
        <Link
          href={`/courses/${id}`}
          className='absolute inset-0 z-0'
          aria-label={title}
        >
          {!imageError ? (
            <Image
              src={thumbnailUrl || "/images/course-placeholder.png"}
              alt={title}
              fill
              sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
              className='object-cover hover:scale-110 transition-transform duration-500'
              onError={handleImageError}
            />
          ) : (
            <div className='flex items-center justify-center h-full bg-linear-to-br from-gray-200 to-gray-300'>
              <BookOpen className='w-16 h-16 text-gray-400' />
            </div>
          )}
        </Link>

        {/* DASHBOARD MENU (OUTSIDE LINK) */}
        {dashboardActions && (
          <div className='absolute top-3 right-3 z-20'>
            <button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(prev => !prev);
              }}
              className='w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100'
              aria-label='Course actions'
            >
              <MoreVertical className='w-4 h-4 text-gray-600' />
            </button>

            {showMenu && (
              <div
                className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border py-2'
                onClick={e => e.stopPropagation()}
              >
                {dashboardActions.onView && (
                  <button
                    onClick={() => dashboardActions.onView?.(id)}
                    className='w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2'
                  >
                    <Eye className='w-4 h-4' />
                    View Details
                  </button>
                )}

                {dashboardActions.onEdit && (
                  <button
                    onClick={() => dashboardActions.onEdit?.(id)}
                    className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'
                  >
                    <Edit className='w-4 h-4' />
                    Edit Course
                  </button>
                )}

                {dashboardActions.onDelete && (
                  <button
                    onClick={() => dashboardActions.onDelete?.(id)}
                    className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2'
                  >
                    <Trash2 className='w-4 h-4' />
                    Delete Course
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className='absolute top-4 left-4 z-10'>
          <span
            className={` text-white text-sm  px-2 py-1.5 rounded-xl shadow-lg backdrop-blur-sm`}
          >
            {category?.name}
          </span>
        </div>

        <div className='absolute top-4 right-4 z-10 bg-white rounded-lg px-3 mr-8 shadow-lg'>
          <div className='flex items-center gap-1'>
            <span className='text-orange-600 font-black text-md '>${price}</span>
            {originalPrice && originalPrice > price && (
              <span className='text-gray-400 text-md line-through'>${originalPrice}</span>
            )}
          </div>
        </div>

        {discountPercentage > 0 && (
          <div className='absolute bottom-4 right-4 z-10 bg-red-500 text-white text-md font-bold px-2 py-1 rounded shadow-lg'>
            {discountPercentage}% OFF
          </div>
        )}

        <button
          onClick={handleWishlistToggle}
          disabled={isWishlistLoading}
          className={`absolute bottom-4 left-4 z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isInWishlist
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white"
          } ${isWishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 transition-all ${isInWishlist ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className='p-5 flex flex-col grow'>
        <div className='flex items-center justify-between gap-2 mb-3'>
          <div className='flex items-center gap-1'>
            <div
              className='flex items-center'
              aria-label={`Rating: ${rating} out of 5`}
            >
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating) ? "fill-orange-400 text-orange-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className='text-sm font-semibold text-gray-900'>{rating}</span>
            <span className='text-sm text-gray-500'>({reviewCount})</span>
          </div>
          <div>
            {/* Course Badge */}
            {dashboardActions && (
              <div className='px-4 pt-3'>
                <span
                  className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${STATUS_CONFIG[status as CourseStatus].className}`}
                >
                  {STATUS_CONFIG[status as CourseStatus].label}
                </span>
              </div>
            )}
          </div>
        </div>

        <Link href={`/courses/${id}`}>
          <h3 className='text-lg font-semibold  mb-4 line-clamp-2 min-h-14 group-hover:text-orange-600 transition-colors cursor-pointer'>
            {title}
          </h3>
        </Link>

        <div className='flex items-center gap-4 text-sm text-gray-600 mb-4 flex-wrap'>
          <div
            className='flex items-center gap-1'
            title={`${lessons} lessons`}
          >
            <BookOpen className='w-4 h-4 text-orange-600 shrink-0' />
            <span className='whitespace-nowrap'>{lessons} Lessons</span>
          </div>
          <div
            className='flex items-center gap-1'
            title={`Duration: ${duration}`}
          >
            <Clock className='w-4 h-4 text-orange-600 shrink-0' />
            <span className='whitespace-nowrap'>{duration}</span>
          </div>
          <div
            className='flex items-center gap-1'
            title={`${students} students enrolled`}
          >
            <Users className='w-4 h-4 text-orange-600 shrink-0' />
            <span className='whitespace-nowrap'>{students}</span>
          </div>
        </div>

        <div className='mt-auto pt-4 border-t border-gray-100'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 min-w-0'>
              <div className='relative w-8 h-8 shrink-0'>
                {instructor.avatar ? (
                  <Image
                    src={instructor.avatar}
                    alt={instructor.name}
                    fill
                    sizes='32px'
                    className='rounded-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full rounded-full bg-orange-200 flex items-center justify-center'>
                    <Users className='w-4 h-4 text-orange-600' />
                  </div>
                )}
              </div>
              <span className='text-sm font-medium text-gray-700 truncate'>{instructor.name}</span>
            </div>

            <div className='flex items-center gap-2 shrink-0'>
              {onAddToCart && (
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className={`p-2 rounded-lg transition-all ${
                    isInCart
                      ? "bg-green-100 text-green-600 cursor-default"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                  }`}
                  title={isInCart ? "In cart" : "Add to cart"}
                  aria-label={isInCart ? "In cart" : "Add to cart"}
                >
                  <ShoppingCart className='w-4 h-4' />
                </button>
              )}

              <Link href={`/checkout/${id}`}>
                <button
                  type='button'
                  className='px-4 py-1 bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-lg text-md font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap'
                >
                  Enroll
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

export default CourseCard;
