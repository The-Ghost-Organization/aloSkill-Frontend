import { FadeIn } from "@/lib/course/utils.tsx";
import { Award, BookOpen, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CourseDetailsPublic } from "../../allCourses.types.ts";

function InstructorTab({ instructors }: { instructors: CourseDetailsPublic["courseInstructors"] }) {
  return (
    <div className='space-y-6 sm:space-y-8'>
      {instructors?.map((instructor, index) => (
        <FadeIn
          key={instructor.instructorId + index}
          delay={index * 100}
        >
          <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 bg-linear-to-br from-orange-50 to-purple-50 rounded-md sm:rounded-md border-2 border-orange-200 hover:shadow-lg transition-all group'>
            <div className='relative shrink-0 mx-auto sm:mx-0'>
              <div className='relative w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden ring-4 ring-white group-hover:ring-[#da7c36] transition-all'>
                <Link href={`/instructors/${instructor.userId}`}>
                  <Image
                    src={instructor.avatarUrl || ""}
                    alt={instructor.displayName}
                    fill
                    className='object-cover group-hover:scale-110 transition-transform duration-500'
                  />
                </Link>
              </div>
              <div className='absolute -bottom-2 -right-2  w-10 h-10  bg-linear-to-br from-[#d15100] to-[#da7c36] rounded-full flex items-center justify-center border-4 border-white group-hover:scale-125 transition-transform'>
                <Award className='w-5 h-5  text-white' />
              </div>
            </div>

            <div className='flex-1 text-center sm:text-left'>
              <div className='flex items-center justify-center sm:justify-start gap-2  text-sm text-[#da7c36] font-semibold mb-2'>
                <Star className='w-3 h-3 sm:w-4 sm:h-4 fill-[#da7c36]' />
                Expert in {instructor.expertise}
              </div>
              <Link href={`/instructors/${instructor.userId}`}>
                <h3 className='text-lg font-bold text-[#074079] mb-3 group-hover:text-[#da7c36] transition-colors'>
                  {instructor.displayName}
                </h3>
              </Link>

              {/* Stats */}
              <div className='flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 mb-3 sm:mb-4'>
                <div className='flex items-center gap-2  text-sm'>
                  <Users className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500' />
                  <span className='text-gray-700'>{instructor.totalStudents} Students</span>
                </div>
                <div className='flex items-center gap-2  text-sm'>
                  <BookOpen className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500' />
                  <span className='text-gray-700'>{instructor.totalCourses} Courses</span>
                </div>
                <div className='flex items-center gap-2  text-sm'>
                  <Star className='w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500' />
                  <span className='text-gray-700'>{instructor.rating} Rating</span>
                </div>
              </div>

              {/* Bio */}
              <p className=' text-sm text-gray-700 leading-relaxed'>{instructor.bio}</p>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
export default InstructorTab;
