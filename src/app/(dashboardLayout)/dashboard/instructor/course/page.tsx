"use client";

import type { CourseType } from "@/app/(withoutSidebarLayout)/courses/allCourses.types.ts";
import CourseCard from "@/app/(withoutSidebarLayout)/courses/CourseCard.tsx";
// import { useSession } from "next-auth/react";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "../../../../../lib/api/client";
import { useSessionContext } from "../../../../contexts/SessionContext";

const InstructorCoursePage = () => {
  const [apiError, setApiError] = useState<string>("");
  const [courses, setCourses] = useState<CourseType[]>([]);
  // const { data: sessionData } = useSession();
  const { isLoading, user } = useSessionContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user?.id) return;
    const getCourses = async () => {
      setApiError("");
      const coursesFromDB = await apiClient.get<CourseType[]>(
        `/course/instructor/allCourses?userId=${user?.id}`
      );

      try {
        if (!coursesFromDB.success) {
          setApiError(coursesFromDB.message || "Something went wrong! try again later.");
          return;
        }
        if (!coursesFromDB.data || coursesFromDB.data.length === 0) {
          setApiError("No courses found!");
          return;
        }
        setCourses(coursesFromDB.data);
      } catch (_e) {
        setApiError("Something went wrong while fetching the courses.");
      }
    };
    getCourses();
  }, [user?.id, isLoading]);

  if (isLoading) {
    return (
      <p className='text-md font-semibold text-gray-600 flex items-center gap-2'>
        <Loader className='animate-spin' /> Loading...
      </p>
    );
  }

  return (
    <div className='min-h-screen w-full px-4'>
      {/* Courses Grid */}
      {apiError ? (
        <p className='text-md font-semibold text-red-400'>{apiError}</p>
      ) : (
        <>
          <div className='grid grid-cols-3 gap-3'>
            {courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                dashboardActions={{
                  onView: id => router.push(`/dashboard/instructor/course/${id}`),
                  onEdit: id => router.push(`/dashboard/instructor/create-course/${id}`),
                  onDelete: id => router.push(`/dashboard/instructor/create-course/${id}`),
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InstructorCoursePage;
