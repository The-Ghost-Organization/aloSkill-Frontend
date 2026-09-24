"use client";

import type { CourseType } from "@/app/(withoutSidebarLayout)/courses/allCourses.types";
import CourseCard from "@/app/(withoutSidebarLayout)/courses/CourseCard";
import { BookOpen, RotateCcw } from "lucide-react";
import { memo } from "react";

interface CourseGridProps {
  courses: CourseType[];
  isLoading?: boolean;
  emptyStateMessage?: string;
  onAddToCart?: (courseId: string) => void;
  onAddToWishlist?: (courseId: string | number) => void;
  cartItems?: { courseId: string; quantity: number }[];
  wishlistItems?: Set<string | number>;
  isEnrolled?: boolean;
  user?: any;
  viewMode?: "grid" | "list";
  onClearFilters?: () => void;
}

const CourseGrid = memo(function CourseGrid({
  courses,
  isLoading = false,
  emptyStateMessage = "No courses available at the moment.",
  onAddToCart,
  onAddToWishlist,
  cartItems = [],
  wishlistItems = new Set(),
  isEnrolled,
  user,
  viewMode = "grid",
  onClearFilters,
}: CourseGridProps) {
  if (isLoading) {
    return (
      <div
        className={
          viewMode === "list"
            ? "space-y-5"
            : "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        }
      >
        {[...Array(viewMode === "list" ? 4 : 6)].map((_, index) => (
          <div
            key={index}
            className={`overflow-hidden rounded-3xl border border-slate-200 bg-white animate-pulse ${
              viewMode === "list" ? "sm:flex" : ""
            }`}
          >
            <div
              className={`bg-slate-200 ${
                viewMode === "list" ? "aspect-video sm:min-h-[260px] sm:w-[310px]" : "aspect-[16/10]"
              }`}
            />
            <div className='flex-1 space-y-4 p-5'>
              <div className='h-4 w-28 rounded bg-slate-200' />
              <div className='h-6 rounded bg-slate-200' />
              <div className='h-6 w-4/5 rounded bg-slate-200' />
              <div className='flex gap-2'>
                <div className='h-9 flex-1 rounded-xl bg-slate-100' />
                <div className='h-9 flex-1 rounded-xl bg-slate-100' />
                <div className='h-9 flex-1 rounded-xl bg-slate-100' />
              </div>
              <div className='h-px bg-slate-100' />
              <div className='flex items-center justify-between'>
                <div className='h-9 w-32 rounded bg-slate-100' />
                <div className='h-10 w-28 rounded-xl bg-slate-200' />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!courses?.length) {
    return (
      <div className='rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center sm:py-20'>
        <div className='mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-50 text-orange-600'>
          <BookOpen className='h-8 w-8' />
        </div>
        <h3 className='mt-5 text-xl font-bold text-slate-900'>No courses found</h3>
        <p className='mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500'>{emptyStateMessage}</p>
        {onClearFilters && (
          <button
            type='button'
            onClick={onClearFilters}
            className='mx-auto mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700'
          >
            <RotateCcw className='h-4 w-4' /> Reset filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "list"
          ? "space-y-5"
          : "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
      }
    >
      {courses.map(course => {
        const enrolledForThisCourse =
          typeof isEnrolled === "boolean"
            ? isEnrolled
            : Boolean(
                user?.id && course.enrollments?.some(enrollment => enrollment.userId === user.id)
              );

        return (
          <CourseCard
            key={course.id}
            course={course}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            isInCart={cartItems.some(item => item.courseId === course.id)}
            isEnrolled={enrolledForThisCourse}
            isInWishlist={wishlistItems.has(course.id)}
            user={user}
            viewMode={viewMode}
          />
        );
      })}
    </div>
  );
});

export default CourseGrid;
