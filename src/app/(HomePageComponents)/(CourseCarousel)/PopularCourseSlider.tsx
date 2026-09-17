"use client";

import Slider from "@/components/slider/Slider";
import { useEffect, useState } from "react";
import type { CourseType } from "../../(withoutSidebarLayout)/courses/allCourses.types";
import CourseCard from "../../(withoutSidebarLayout)/courses/CourseCard";
import { courseAddToCartHandler } from "../../../lib/course/courseHelper";
import { courseDraftStorage } from "../../../lib/storage/courseDraftStorage";
import { useSessionContext } from "../../contexts/SessionContext";

export default function PopularCourseSlider({ courses }: { courses: CourseType[] }) {
  const [cartItems, setCartItems] = useState<{ courseId: string; quantity: number }[]>([]);
  const [wishlistItems] = useState<Set<string>>(new Set());
  const { setCartUpdate } = useSessionContext();

  useEffect(() => {
    const storedCartItems =
      courseDraftStorage.get<{ courseId: string; quantity: number }[]>() || [];
    setCartItems(storedCartItems);
  }, []);

  const handleAddToCart = (courseId: string) => {
    const updatedCart = courseAddToCartHandler(courseId);
    setCartItems(updatedCart);
    setCartUpdate?.(prev => !prev);
  };

  const courseSlides = courses.map(course => (
    <CourseCard
      key={course.id}
      course={course}
      onAddToCart={handleAddToCart}
      isInCart={cartItems.some(item => item.courseId === course.id)}
      isInWishlist={wishlistItems.has(course.id)}
    />
  ));

  return (
    <Slider
      slides={courseSlides}
      visibleCount={2}
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
  );
}
