import { Plus } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "../Components";
import CourseManagement from "./CourseManagement";

export default function CoursesPage() {
  return (
    <div className='animate-page-enter'>
      <SectionHeader
        title='Course Management'
        sub='Manage the complete course catalogue, performance and publishing lifecycle'
        action={
          <Link
            href='/dashboard/admin/courses/create-course'
            className="inline-flex items-center gap-2 rounded-lg bg-linear-to-br from-orange-500 to-orange-600 px-4 py-2.5 font-['Outfit'] text-sm font-semibold text-white transition hover:from-orange-400 hover:to-orange-500"
          >
            <Plus size={16} /> Add Course
          </Link>
        }
      />
      <CourseManagement />
    </div>
  );
}
