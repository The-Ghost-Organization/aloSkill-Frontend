"use client";

import { apiClient } from "@/lib/api/client";
import { BookOpen, RefreshCw, Star, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import DashboardState from "../components/DashboardState";

type StudentInstructor = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  expertise: string | null;
  bio: string | null;
  ratingAverage: number;
  ratingCount: number;
  courses: { id: string; title: string }[];
};

export default function TeachersPage() {
  const [instructors, setInstructors] = useState<StudentInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInstructors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get<StudentInstructor[]>("/user/student/me/instructors");
      if (!response.success) throw new Error("Could not load instructors");
      setInstructors(response.data ?? []);
    } catch {
      setError("We could not load the instructors connected to your enrolled courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInstructors();
  }, [loadInstructors]);

  if (loading) return <DashboardState kind='loading' title='Loading instructors' description='Finding instructors from your enrolled courses.' />;
  if (error) return <DashboardState kind='error' title='Instructors are unavailable' description={error} action={<button type='button' onClick={() => void loadInstructors()} className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white'>Try again</button>} />;
  if (instructors.length === 0) return <DashboardState kind='empty' icon={UserRound} title='No instructors yet' description='When you enroll in a course, its instructor will appear here.' action={<Link href='/courses' className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white'>Explore courses</Link>} />;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>My Instructors</h1>
          <p className='mt-1 text-sm text-gray-500'>Instructors connected to courses you are currently or previously enrolled in.</p>
        </div>
        <button type='button' onClick={() => void loadInstructors()} className='inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-300'>
          <RefreshCw className='h-4 w-4' /> Refresh
        </button>
      </div>

      <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
        {instructors.map(instructor => (
          <article key={instructor.id} className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
            <div className='flex items-start gap-4'>
              <div className='relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-orange-50'>
                {instructor.avatarUrl ? (
                  <Image src={instructor.avatarUrl} alt={instructor.displayName} fill sizes='64px' className='object-cover' />
                ) : (
                  <div className='flex h-full w-full items-center justify-center text-orange-400'><UserRound className='h-7 w-7' /></div>
                )}
              </div>
              <div className='min-w-0 flex-1'>
                <h2 className='truncate font-bold text-gray-900'>{instructor.displayName}</h2>
                <p className='mt-0.5 truncate text-sm text-gray-500'>{instructor.expertise || "AloSkill Instructor"}</p>
                <div className='mt-2 flex items-center gap-1 text-sm'>
                  <Star className='h-4 w-4 fill-amber-400 text-amber-400' />
                  <span className='font-semibold text-gray-800'>{instructor.ratingAverage.toFixed(1)}</span>
                  <span className='text-gray-400'>({instructor.ratingCount})</span>
                </div>
              </div>
            </div>

            {instructor.bio && <p className='mt-4 line-clamp-3 text-sm leading-6 text-gray-600'>{instructor.bio}</p>}

            <div className='mt-4 rounded-lg bg-gray-50 p-3'>
              <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400'><BookOpen className='h-4 w-4' /> Your courses</div>
              <div className='mt-2 space-y-1.5'>
                {instructor.courses.slice(0, 3).map(course => (
                  <Link key={course.id} href={`/courses/${course.id}`} className='block truncate text-sm font-medium text-gray-700 hover:text-orange-600'>{course.title}</Link>
                ))}
                {instructor.courses.length > 3 && <p className='text-xs text-gray-400'>+{instructor.courses.length - 3} more</p>}
              </div>
            </div>

            <Link href={`/instructors/${instructor.id}`} className='mt-4 block rounded-lg border border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-600'>View instructor profile</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
