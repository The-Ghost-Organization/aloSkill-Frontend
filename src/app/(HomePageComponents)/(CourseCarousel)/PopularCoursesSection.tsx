"use client";

import SectionHeader from "@/components/sections/SectionHeader";
import Slider from "@/components/slider/Slider";
import { apiClient } from "@/lib/api/client";
import { courseAddToCartHandler } from "@/lib/course/utils.tsx";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CourseCard from "../../(withoutSidebarLayout)/courses/CourseCard";
import type { CourseType } from "../../(withoutSidebarLayout)/courses/allCourses.types";
import { useSessionContext } from "../../contexts/SessionContext";

export default function PopularCoursesSection() {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<{ courseId: string; quantity: number }[]>([]);
  const [wishlistItems] = useState<Set<string>>(new Set());

  const router = useRouter();
  const { setCartUpdate } = useSessionContext();

  // 🔹 Fetch courses from DB
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<CourseType[]>("/course/public/allCourses");
        // const response = await apiClient.get<CourseType[]>("/course/public/allCourses?isHome=true");
        setCourses(response.data ?? []);
      } catch (_error) {
        // console.error("Failed to fetch popular courses", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // const handleEnroll = useCallback((courseId: string) => {
  //   console.log("Enroll clicked:", courseId);
  // }, []);

  const handleAddToCart = useCallback(
    (courseId: string) => {
      const cartItem = courseAddToCartHandler(courseId);
      setCartItems(cartItem);
      setCartUpdate?.(prev => !prev);
    },
    [setCartUpdate]
  );

  // const handleAddToWishlist = useCallback((courseId: string) => {
  //   // console.log("Add to wishlist clicked:", courseId);
  // }, []);

  const courseSlides = courses.map(course => (
    <CourseCard
      key={course.id}
      course={course}
      onAddToCart={handleAddToCart}
      // onAddToWishlist={handleAddToWishlist}
      isInCart={cartItems.some(item => item.courseId === course.id)}
      isInWishlist={wishlistItems.has(course.id)}
    />
  ));

  return (
    <section className='py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 relative'>
      <div className='absolute top-16 right-16 opacity-10 pointer-events-none'>
        <Pencil className='w-32 h-32 text-orange-400 rotate-12' />
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        <SectionHeader
          badge='Top Popular Course'
          title={
            <>
              Aloskill Course Student
              <br />
              Can Join With Us.
            </>
          }
          showButton
          buttonText='View All Courses'
          onButtonClick={() => router.push("/courses")}
          isLoading={isLoading}
        />

        <Slider
          slides={courseSlides}
          visibleCount={1}
          breakpoints={{
            640: { visibleCount: 1 },
            768: { visibleCount: 2 },
            1440: { visibleCount: 3 },
          }}
          autoplay={true}
          loop
          autoplayInterval={3000}
          showArrows
          showDots
          gap={16}
        />
      </div>
    </section>
  );
}
