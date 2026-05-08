// "use client";

// import { useSessionContext } from "@/app/contexts/SessionContext.tsx";
// import { apiClient } from "@/lib/api/client.ts";
// import { Loader } from "lucide-react";
// import { useEffect, useState } from "react";
// import type { CourseType } from "../../../(withoutSidebarLayout)/courses/allCourses.types.ts";
// import CourseCard from "../../../(withoutSidebarLayout)/courses/CourseCard.tsx";
// export default function DashboardPage() {
//   // const [currentSlide, setCurrentSlide] = useState(0);
//   const [courses, setCourses] = useState<CourseType[]>([]);
//   const [apiError, setApiError] = useState<string>("");
//   const { isLoading, user } = useSessionContext();

//   useEffect(() => {
//     if (isLoading) return;
//     if (!user?.id) return;
//     const getCourses = async () => {
//       setApiError("");
//       const coursesFromDB = await apiClient.get<CourseType[]>(
//         `/course/student/allCourses?userId=${user?.id}`
//       );

//       try {
//         if (!coursesFromDB.success) {
//           setApiError("Something went wrong! try again later.");
//           return;
//         }
//         if (!coursesFromDB.data || coursesFromDB.data.length === 0) {
//           setApiError("No courses found!");
//           return;
//         }
//         setCourses(coursesFromDB.data);
//       } catch (_e) {
//         setApiError("Something went wrong while fetching the courses.");
//       }
//     };
//     getCourses();
//   }, [user?.id, isLoading]);

//   const isCourseCompleted = (course: CourseType) => {
//     const totalLessons = course.modules.reduce((acc, module) => {
//       return acc + (module._count?.lessons || 0);
//     }, 0);

//     const completedLessons = course.lessonProgress?.filter(lp => lp.completed === true).length;

//     return totalLessons > 0 && completedLessons === totalLessons;
//   };

//   const completed = courses.reduce(
//     (value, course) => (isCourseCompleted(course) ? value + 1 : value),
//     0
//   );

//   if (isLoading) {
//     return (
//       <p className='text-md font-semibold text-gray-600 flex items-center gap-2'>
//         <Loader className='animate-spin' /> Loading...
//       </p>
//     );
//   }

//   const stats = [
//     {
//       icon: "🕐",
//       value: courses.length,
//       label: "Enrolled Courses",
//       bgColor: "bg-orange-100",
//     },
//     {
//       icon: "📚",
//       value: courses.filter(course => course._count.LessonProgress > 0).length,
//       label: "Active Courses",
//       bgColor: "bg-blue-200",
//     },
//     {
//       icon: "✓",
//       value: completed,
//       label: "Completed Courses",
//       bgColor: "bg-green-200",
//     },
//     {
//       icon: "👥",
//       value: courses.reduce((value, course) => course._count.courseInstructors + value, 0),
//       label: "Course Instructors",
//       bgColor: "bg-orange-200",
//     },
//   ];

//   return (
//     <div>
//       {/* Stats Grid */}
//       <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
//         {stats.map((stat, index) => (
//           <div
//             key={index}
//             className={`${stat.bgColor} rounded px-6 py-4`}
//           >
//             <div className='flex items-center gap-4'>
//               <div className='text-3xl'>{stat.icon}</div>
//               <div>
//                 <div className='text-3xl font-bold text-gray-900'>{stat.value}</div>
//                 <div className='text-sm text-gray-600'>{stat.label}</div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Course Section */}
//       <div>
//         <div className='flex items-center justify-between mb-4'>
//           <h3 className='text-xl font-semibold text-gray-900'>
//             Let &apos;s start learning, {user?.name}
//           </h3>
//           <div className='flex gap-2'>
//             <button className='w-10 h-10 rounded-lg border border-orange-300 text-orange-500'>
//               ←
//             </button>
//             <button className='w-10 h-10 rounded-lg border border-orange-300 text-orange-500'>
//               →
//             </button>
//           </div>
//         </div>

//         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
//           {courses.length > 0 ? (
//             courses?.map(course => (
//               <CourseCard
//                 key={course.id}
//                 course={course}
//                 isEnrolled={true}
//               />
//             ))
//           ) : (
//             <p>{apiError ? apiError : "Yet You have no purchased course!"}</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useSessionContext } from "@/app/contexts/SessionContext";
import { apiClient } from "@/lib/api/client";
import { BookOpen, CheckCircle, Clock, Loader, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { CourseType } from "../../../(withoutSidebarLayout)/courses/allCourses.types";
import CourseCard from "../../../(withoutSidebarLayout)/courses/CourseCard";

export default function DashboardPage() {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [apiError, setApiError] = useState<string>("");
  const { isLoading, user } = useSessionContext();

  useEffect(() => {
    if (isLoading || !user?.id) return;

    const getCourses = async () => {
      setApiError("");
      try {
        const response = await apiClient.get<CourseType[]>(
          `/course/student/allCourses?userId=${user?.id}`
        );

        if (!response.success) {
          setApiError("Something went wrong! try again later.");
          return;
        }
        setCourses(response.data || []);
      } catch (error) {
        setApiError("Failed to fetch courses.");
      }
    };
    getCourses();
  }, [user?.id, isLoading]);

  const isCourseCompleted = (course: CourseType) => {
    const totalLessons = course.modules.reduce(
      (acc, module) => acc + (module._count?.lessons || 0),
      0
    );
    const completedCount = course.lessonProgress?.filter(lp => lp.completed).length || 0;
    return totalLessons > 0 && completedCount === totalLessons;
  };

  const completedCourses = courses.filter(isCourseCompleted);
  const inProgressCourses = courses.filter(c => !isCourseCompleted(c));

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 p-6 font-medium text-gray-600'>
        <Loader className='animate-spin' /> Loading your dashboard...
      </div>
    );
  }

  const stats = [
    {
      label: "Enrolled Courses",
      value: courses.length,
      icon: <BookOpen className='w-6 h-6 text-blue-600' />,
      bg: "bg-blue-50",
    },
    {
      label: "In Progress",
      value: inProgressCourses.length,
      icon: <Clock className='w-6 h-6 text-orange-600' />,
      bg: "bg-orange-50",
    },
    {
      label: "Completed",
      value: completedCourses.length,
      icon: <CheckCircle className='w-6 h-6 text-green-600' />,
      bg: "bg-green-50",
    },
    {
      label: "Instructors",
      value: Array.from(new Set(courses.flatMap(c => c.courseInstructors || []))).length,
      icon: <Users className='w-6 h-6 text-purple-600' />,
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className='space-y-8'>
      {/* 1. Stats Overview */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`${stat.bg} p-5 rounded-xl border border-white/50 shadow-sm`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 font-medium'>{stat.label}</p>
                <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
              </div>
              <div className='p-3 bg-white rounded-lg shadow-xs'>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. In Progress Section (Direct Action) */}
      <section>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-bold text-gray-900'>Continue Learning</h3>
        </div>

        {inProgressCourses.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {inProgressCourses.map(course => (
              <div
                key={course.id}
                className='relative group'
              >
                <CourseCard
                  course={course}
                  isEnrolled={true}
                />
                {/* Progress Overlay/Bar can be added inside CourseCard */}
              </div>
            ))}
          </div>
        ) : (
          <div className='bg-gray-50 border-2 border-dashed rounded-xl p-8 text-center text-gray-500'>
            {apiError || "No active courses. Ready to start something new?"}
          </div>
        )}
      </section>

      {/* 3. Recently Completed (Brief overview) */}
      {completedCourses.length > 0 && (
        <section>
          <h3 className='text-lg font-bold text-gray-900 mb-4'>Completed Courses</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity'>
            {completedCourses.slice(0, 3).map(course => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={true}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
