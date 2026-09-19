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
      <p className='flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600 shadow-sm'>
        <Loader className='animate-spin' /> Loading...
      </p>
    );
  }

  return (
    <div className='w-full'>
      {/* Courses Grid */}
      {apiError ? (
        <div className='rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700'>{apiError}</div>
      ) : (
        <>
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
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
