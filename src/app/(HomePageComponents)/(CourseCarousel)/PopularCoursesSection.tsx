import { Pencil } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import type { CourseType } from "../../(withoutSidebarLayout)/courses/allCourses.types";
import SectionHeader from "../../../components/sections/SectionHeader";
import { getAllCourses } from "../../../lib/course/courseHelper";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import PopularCourseSlider from "./PopularCourseSlider";

export default async function PopularCoursesSection() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const response = (await getAllCourses(user?.id)) as { data: any };
  const courses: CourseType[] | [] =
    response?.data && Array.isArray(response.data) ? response.data : [];

  return (
    <section className='py-16 md:py-24 bg-linear-to-b from-white to-gray-50 relative'>
      <div className='absolute top-16 right-16 opacity-10 pointer-events-none'>
        <Pencil className='w-32 h-32 text-orange-400 rotate-12' />
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        <Link href={"/courses"}>
          <SectionHeader
            title='Aloskill Course Student'
            color_title='Can Join With Us.'
            showButton
            buttonText='View All Courses'
          />
        </Link>
        <PopularCourseSlider courses={courses} />
      </div>
    </section>
  );
}
