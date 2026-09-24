"use client";

import type { CourseType } from "@/app/(withoutSidebarLayout)/courses/allCourses.types";
import CourseCard from "@/app/(withoutSidebarLayout)/courses/CourseCard";
import { useSessionContext } from "@/app/contexts/SessionContext";
import { apiClient } from "@/lib/api/client";
import { BookOpenCheck, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardState from "../components/DashboardState";

type CourseFilter = "ALL" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

function getProgress(course: CourseType) {
  const totalLessons = course.modules.reduce((total, module) => total + (module._count?.lessons ?? 0), 0);
  if (totalLessons === 0) return 0;
  const totalProgress = course.lessonProgress?.reduce((sum, item) => sum + Math.min(100, item.progressValue ?? 0), 0) ?? 0;
  return Math.min(100, Math.round(totalProgress / totalLessons));
}

function getProgressState(course: CourseType): Exclude<CourseFilter, "ALL"> {
  const progress = getProgress(course);
  if (progress >= 100) return "COMPLETED";
  if (progress > 0) return "IN_PROGRESS";
  return "NOT_STARTED";
}

export default function CoursesPage() {
  const { user, isLoading: sessionLoading } = useSessionContext();
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<CourseFilter>("ALL");

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

  const counts = useMemo(() => {
    const result = { ALL: courses.length, NOT_STARTED: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    courses.forEach(course => result[getProgressState(course)]++);
    return result;
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return courses
      .filter(course => !query || course.title.toLowerCase().includes(query) || course.createdBy.displayName.toLowerCase().includes(query))
      .filter(course => filter === "ALL" || getProgressState(course) === filter)
      .sort((a, b) => {
        const aLast = Math.max(...(a.lessonProgress ?? []).map(item => +new Date(item.lastViewedAt ?? 0)), 0);
        const bLast = Math.max(...(b.lessonProgress ?? []).map(item => +new Date(item.lastViewedAt ?? 0)), 0);
        return bLast - aLast;
      });
  }, [courses, filter, searchQuery]);

  if (sessionLoading || loading) return <DashboardState kind='loading' title='Loading your courses' description='Getting your enrollments and learning progress.' />;
  if (error) return <DashboardState kind='error' title='Your courses could not be loaded' description={error} action={user?.id ? <button type='button' onClick={() => void loadCourses()} className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'>Try again</button> : <Link href='/auth/signin' className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white'>Sign in</Link>} />;
  if (courses.length === 0) return <DashboardState kind='empty' icon={BookOpenCheck} title='No enrolled courses yet' description='Courses you purchase or enroll in will appear here.' action={<Link href='/courses' className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'>Explore courses</Link>} />;

  const filters: Array<{ value: CourseFilter; label: string }> = [
    { value: "ALL", label: "All" },
    { value: "NOT_STARTED", label: "Not started" },
    { value: "IN_PROGRESS", label: "In progress" },
    { value: "COMPLETED", label: "Completed" },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div><h1 className='text-2xl font-bold text-gray-900'>My Courses</h1><p className='mt-1 text-sm text-gray-500'>Continue learning from the courses you enrolled in.</p></div>
        <button type='button' onClick={() => void loadCourses()} className='inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-300'><RefreshCw className='h-4 w-4' /> Refresh</button>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {filters.map(item => (
          <button key={item.value} type='button' onClick={() => setFilter(item.value)} className={`rounded-xl border p-4 text-left transition ${filter === item.value ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white hover:border-orange-200"}`}>
            <p className='text-2xl font-bold text-gray-900'>{counts[item.value]}</p>
            <p className='mt-1 text-xs font-semibold text-gray-500'>{item.label}</p>
          </button>
        ))}
      </div>

      <div className='rounded-xl border border-gray-200 bg-white p-4'>
        <div className='relative'><Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' /><input type='search' className='w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-orange-400 focus:outline-none' placeholder='Search by course or instructor…' value={searchQuery} onChange={event => setSearchQuery(event.target.value)} /></div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>{filteredCourses.map(course => <CourseCard key={course.id} course={course} isEnrolled={true} />)}</div>
      ) : (
        <DashboardState kind='empty' title='No courses match your filters' description='Try another search term or learning status.' action={<button type='button' onClick={() => { setSearchQuery(""); setFilter("ALL"); }} className='rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-300'>Clear filters</button>} />
      )}
    </div>
  );
}
