//courses.tsx - COURSES TAB COMPONENT
import CourseCard from "@/app/(withoutSidebarLayout)/courses/CourseCard.tsx";
import { useSessionContext } from "@/app/contexts/SessionContext.tsx";
import type { InstructorDetail } from "@/types/instructor.types.ts";
import { BookOpen } from "lucide-react";
import { useCallback, useState } from "react";
import { courseAddToCartHandler } from '../../../../lib/course/courseHelper';

export function CoursesTab({
  courses,
  instructorId,
}: {
  courses: InstructorDetail["ownedCourses"];
  instructorId: string | null;
}) {
  const [cartItems, setCartItems] = useState<{ courseId: string; quantity: number }[]>([]);
  const [wishlistItems] = useState<Set<string>>(new Set());
  const { setCartUpdate, user } = useSessionContext();
  const handleAddToCart = useCallback(
    (courseId: string) => {
      const cartItem = courseAddToCartHandler(courseId);
      setCartItems(cartItem);
      setCartUpdate?.(prev => !prev);
    },
    [setCartUpdate]
  );

  return (
    <div className=' animate-fade-in-content'>
      {courses.length <= 0 ? (
        <div className='text-center  py-12'>
          <BookOpen className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Courses Yet</h3>
          <p className='text-gray-500'>This instructor hasnt published any courses yet.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              isOwner={user?.id === instructorId}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
