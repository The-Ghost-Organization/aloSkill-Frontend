"use client";

import type { CourseType } from "@/app/(withoutSidebarLayout)/courses/allCourses.types";
import CourseCard from "@/app/(withoutSidebarLayout)/courses/CourseCard";
import { BookOpen } from "lucide-react";
import { memo } from "react";

interface CourseGridProps {
  courses: CourseType[];
  isLoading?: boolean;
  emptyStateMessage?: string;
  onAddToCart?: (courseId: string) => void;
  onAddToWishlist?: (courseId: string | number) => void;
  // cartItems?: Set<string | number>;
  cartItems?: {courseId: string; quantity: number}[];
  wishlistItems?: Set<string | number>;
}

const CourseGrid = memo(function CourseGrid({
  courses,
  isLoading = false,
  emptyStateMessage = "No courses available at the moment.",
  onAddToCart,
  onAddToWishlist,
  cartItems = [],
  // cartItems = new Set(),
  wishlistItems = new Set(),
}: CourseGridProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className='bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse'
          >
            <div className='h-48 bg-gray-200' />
            <div className='p-5 space-y-4'>
              <div className='h-4 bg-gray-200 rounded w-3/4' />
              <div className='h-6 bg-gray-200 rounded' />
              <div className='h-6 bg-gray-200 rounded w-5/6' />
              <div className='flex gap-4'>
                <div className='h-4 bg-gray-200 rounded flex-1' />
                <div className='h-4 bg-gray-200 rounded flex-1' />
              </div>
              <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
                <div className='h-8 bg-gray-200 rounded-full w-24' />
                <div className='h-8 bg-gray-200 rounded w-20' />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 px-4'>
        <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
          <BookOpen className='w-12 h-12 text-gray-400' />
        </div>
        <h3 className='text-xl font-bold text-gray-900 mb-2'>No Courses Found</h3>
        <p className='text-gray-600 text-center max-w-md'>{emptyStateMessage}</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {courses.map(course => (
        <CourseCard
          key={course.id}
          course={course}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          isInCart={cartItems.some(item => item.courseId === course.id)}
          // isInCart={cartItems.has(course.id)}
          isInWishlist={wishlistItems.has(course.id)}
        />
      ))}
    </div>
  );
});

export default CourseGrid;
