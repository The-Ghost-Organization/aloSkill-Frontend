"use client";

import type { CourseType } from "@/app/(withoutSidebarLayout)/courses/allCourses.types";
import CourseCard from "@/app/(withoutSidebarLayout)/courses/CourseCard";
import { useSessionContext } from "@/app/contexts/SessionContext";
import { apiClient } from "@/lib/api/client";
import { BookOpenCheck, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardState from "../components/DashboardState";

type CourseFilter = "All" | "In Progress" | "Completed";

export default function CoursesPage() {
  const { user, isLoading: sessionLoading } = useSessionContext();
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<CourseFilter>("All");

  const loadCourses = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get<CourseType[]>(`/course/student/allCourses?userId=${user.id}`);
      if (!response.success) throw new Error("Could not load courses");
      setCourses(response.data ?? []);
    } catch {
      setError("We could not load your enrolled courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (sessionLoading) return;
    if (!user?.id) {
      setLoading(false);
      setError("Please sign in to view your enrolled courses.");
      return;
    }
    void loadCourses();
  }, [loadCourses, sessionLoading, user?.id]);

  const filteredCourses = useMemo(() => courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    if (filter === "All") return matchesSearch;
    const totalLessons = course.modules.reduce((total, module) => total + (module._count?.lessons ?? 0), 0);
    const completedLessons = course.lessonProgress?.filter(progress => progress.completed).length ?? 0;
    const completed = totalLessons > 0 && completedLessons === totalLessons;
    return matchesSearch && (filter === "Completed" ? completed : !completed);
  }), [courses, filter, searchQuery]);

  if (sessionLoading || loading) return <DashboardState kind='loading' title='Loading your courses' description='Getting your enrollments and learning progress.' />;
  if (error) return <DashboardState kind='error' title='Your courses could not be loaded' description={error} action={user?.id ? <button type='button' onClick={() => void loadCourses()} className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'>Try again</button> : <Link href='/auth/login' className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'>Sign in</Link>} />;
  if (courses.length === 0) return <DashboardState kind='empty' icon={BookOpenCheck} title='No enrolled courses yet' description='Courses you purchase or enroll in will appear here.' action={<Link href='/courses' className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'>Explore courses</Link>} />;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div><h1 className='text-2xl font-bold text-gray-900'>My Courses</h1><p className='mt-1 text-sm text-gray-500'>Continue learning from the courses you enrolled in.</p></div>
        <button type='button' onClick={() => void loadCourses()} className='inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-300'><RefreshCw className='h-4 w-4' /> Refresh</button>
      </div>

      <div className='flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row'>
        <div className='relative flex-1'><Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' /><input type='search' className='w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-orange-400 focus:outline-none' placeholder='Search enrolled courses…' value={searchQuery} onChange={event => setSearchQuery(event.target.value)} /></div>
        <select className='rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none' value={filter} onChange={event => setFilter(event.target.value as CourseFilter)}><option value='All'>All statuses</option><option value='In Progress'>In progress</option><option value='Completed'>Completed</option></select>
      </div>

      {filteredCourses.length > 0 ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>{filteredCourses.map(course => <CourseCard key={course.id} course={course} isEnrolled={true} />)}</div>
      ) : (
        <DashboardState kind='empty' title='No courses match your filters' description='Try a different course title or progress status.' action={<button type='button' onClick={() => { setSearchQuery(""); setFilter("All"); }} className='rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-300'>Clear filters</button>} />
      )}
    </div>
  );
}
