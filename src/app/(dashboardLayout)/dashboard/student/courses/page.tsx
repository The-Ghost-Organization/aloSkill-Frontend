// "use client";

// import ComingSoon from "@/components/shared/ComingSoon.tsx";
// import { useState } from "react";

// export default function CoursesPage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All Courses");
//   const [teacherFilter, setTeacherFilter] = useState("All Teachers");

//   const courses = [
//     {
//       id: 1,
//       title: "Learn Ethical Hacking From Scratch",
//       subtitle: "Learn More About Web Design",
//       progress: 23,
//       hasLecture: true,
//     },
//     {
//       id: 2,
//       title: "SQL for NEWBS Weekender Crash Course",
//       subtitle: "Font Properties Challenge 3 - Chan...",
//       progress: 23,
//       hasLecture: true,
//     },
//     {
//       id: 3,
//       title: "Complete Adobe Lightroom Megacourse Begin...",
//       subtitle: "Adding Content to Our Website",
//       progress: 23,
//       hasLecture: true,
//     },
//     {
//       id: 4,
//       title: "Machine Learning A-2™ Hands-On Python & R L...",
//       subtitle: "CSS Font Property Challenge Solution...",
//       progress: 23,
//       hasLecture: true,
//     },
//     {
//       id: 5,
//       title: "Learn Ethical Hacking From Scratch",
//       subtitle: "Learn More About Web Design",
//       progress: 23,
//       hasLecture: true,
//     },
//     {
//       id: 6,
//       title: "SQL for NEWBS Weekender Crash Course",
//       subtitle: "Font Properties Challenge 3 - Chan...",
//       progress: 23,
//       hasLecture: true,
//     },
//     {
//       id: 7,
//       title: "Complete Adobe Lightroom Megacourse Begin...",
//       subtitle: "Adding Content to Our Website",
//       progress: 23,
//       hasLecture: true,
//     },
//     {
//       id: 8,
//       title: "Machine Learning A-2™ Hands-On Python & R L...",
//       subtitle: "CSS Font Property Challenge Solution...",
//       progress: 23,
//       hasLecture: true,
//     },
//   ];

//   return <ComingSoon pageName='All Courses' />;
//   // return (
//   //   <div className='min-h-screen max-w-7xl w-full mx-auto flex flex-col gap-5'>
//   //     {/* Header */}
//   //     <h3>Courses (957)</h3>

//   //     {/* Filters and Search */}
//   //     <div className='w-full flex space-x-4 justify-between items-center'>
//   //       {/* Search */}
//   //       <div className='w-[40%] flex gap-3 bg-white rounded'>
//   //         {/* <div className="flex items-center pointer-events-none">
//   //                       <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
//   //                   </div> */}
//   //         <input
//   //           type='text'
//   //           className='w-full h-full px-3 py-2 rounded leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400'
//   //           placeholder='📑 Search in your courses...'
//   //           value={searchQuery}
//   //           onChange={e => setSearchQuery(e.target.value)}
//   //         />
//   //       </div>

//   //       {/* Sort and Filter Controls */}
//   //       <div className='w-[60%] flex gap-4 items-center'>
//   //         {/* Sort by */}
//   //         <select className='w-full px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white'>
//   //           <option>Latest</option>
//   //           <option>Oldest</option>
//   //           <option>Alphabetical</option>
//   //         </select>

//   //         {/* Status filter */}
//   //         <select
//   //           className='w-full px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white'
//   //           value={statusFilter}
//   //           onChange={e => setStatusFilter(e.target.value)}
//   //         >
//   //           <option>All Courses</option>
//   //           <option>In Progress</option>
//   //           <option>Completed</option>
//   //           <option>Not Started</option>
//   //         </select>

//   //         {/* Teacher filter */}
//   //         <select
//   //           className='w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white'
//   //           value={teacherFilter}
//   //           onChange={e => setTeacherFilter(e.target.value)}
//   //         >
//   //           <option>All Teachers</option>
//   //           <option>Specific Teacher</option>
//   //         </select>
//   //       </div>
//   //     </div>

//   //     {/* Courses List */}
//   //     <div className='w-full shadow grid grid-cols-4 gap-4'>
//   //       {courses.map(course => (
//   //         <div
//   //           key={course.id}
//   //           className='w-full h-[400px] flex flex-col gap-2 bg-white rounded'
//   //         >
//   //           <div className='w-full h-[45%] border border-gray-300'>this is an image section</div>
//   //           <div className='w-full h-[55%] flex flex-col gap-2 px-2 pb-2'>
//   //             <h3 className='text-lg font-semibold text-gray-900'>{course.title}</h3>
//   //             <p className='text-gray-600'>{course.subtitle}</p>
//   //             <div className='flex-1 flex items-end'>
//   //               <div className='w-full flex items-center justify-between'>
//   //                 <button className='flex items-center px-4 py-2 rounded bg-orange-light text-orange-dark'>
//   //                   Watch Lecture
//   //                 </button>
//   //                 {/* Progress Bar */}
//   //                 <div className='flex justify-between text-sm'>
//   //                   <span>{course.progress}% Completed</span>
//   //                 </div>
//   //               </div>
//   //             </div>
//   //           </div>
//   //         </div>
//   //       ))}
//   //     </div>
//   //   </div>
//   // );
// }

"use client";

import type { CourseType } from "@/app/(withoutSidebarLayout)/courses/allCourses.types.ts";
import CourseCard from "@/app/(withoutSidebarLayout)/courses/CourseCard.tsx";
import { useSessionContext } from "@/app/contexts/SessionContext";
import { apiClient } from "@/lib/api/client";
import { Loader, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function CoursesPage() {
  const { user, isLoading: sessionLoading } = useSessionContext();
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (sessionLoading || !user?.id) return;
    const fetchCourses = async () => {
      const res = await apiClient.get<CourseType[]>(`/course/student/allCourses?userId=${user.id}`);
      if (res.success) setCourses(res.data || []);
      setLoading(false);
    };
    fetchCourses();
  }, [user?.id, sessionLoading]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === "All") return matchesSearch;

    const totalLessons = course.modules.reduce((acc, m) => acc + (m._count?.lessons || 0), 0);
    const completedCount = course.lessonProgress?.filter(lp => lp.completed).length || 0;
    const isDone = totalLessons > 0 && completedCount === totalLessons;

    return filter === "Completed" ? isDone && matchesSearch : !isDone && matchesSearch;
  });

  if (loading)
    return (
      <div className='p-10 flex gap-2'>
        <Loader className='animate-spin' /> Loading...
      </div>
    );

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <h2 className='text-xl font-bold text-gray-900'>My Courses ({filteredCourses.length})</h2>

        <div className='flex flex-1 max-w-md gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              className='w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20'
              placeholder='Search your courses...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className='bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none'
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value='All'>All Status</option>
            <option value='In Progress'>In Progress</option>
            <option value='Completed'>Completed</option>
          </select>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={true}
            />
          ))}
        </div>
      ) : (
        <div className='text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed'>
          <p className='text-gray-500'>No courses found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
