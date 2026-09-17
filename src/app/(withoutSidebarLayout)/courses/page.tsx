// app/courses/page.tsx (or your exact path)
import { apiClient } from "@/lib/api/client.ts";
import type { CourseType } from "./allCourses.types.ts";
import AllCoursesClientPage from "./AllCoursesClientPage";

// Fetch data on the server
async function getAllCourses() {
  try {
    // Fetching all courses without filter query parameters
    const response = await apiClient.get<CourseType[]>("/course/public/allCourses");
    return response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch courses on server:", error);
    return [];
  }
}

export default async function AllCoursesPage() {
  const initialCourses = await getAllCourses();
  return <AllCoursesClientPage initialCourses={initialCourses} />;
}
