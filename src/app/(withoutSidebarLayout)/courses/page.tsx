import { apiClient } from "@/lib/api/client.ts";
import type { CourseType } from "./allCourses.types.ts";
import AllCoursesClientPage from "./AllCoursesClientPage";

export const metadata = {
  title: "All Courses — AloSkill",
  description: "Browse AloSkill courses and learn from experienced instructors.",
};

async function getAllCourses() {
  try {
    const response = await apiClient.get<CourseType[]>("/course/public/allCourses");
    return response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch courses on server:", error);
    return [];
  }
}

export default async function AllCoursesPage() {
  const initialCourses = await getAllCourses();

  return (
    <main className='min-h-screen bg-white'>
      <div className='border-b border-gray-100'>
        <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14'>
          <p className='mb-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-500'>
            Learn with AloSkill
          </p>
          <h1 className='text-3xl font-black leading-none text-gray-900 sm:text-4xl lg:text-5xl'>
            All Courses
          </h1>
          <p className='mt-2 text-sm text-gray-400'>
            {initialCourses.length} {initialCourses.length === 1 ? "course" : "courses"} available to help you build practical skills
          </p>
        </div>
      </div>

      <AllCoursesClientPage initialCourses={initialCourses} />
    </main>
  );
}
