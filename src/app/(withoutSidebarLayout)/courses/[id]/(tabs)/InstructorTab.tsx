import { FadeIn } from "@/lib/course/utils.tsx";
import { Award, BookOpen, GraduationCap, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CourseDetailsPublic } from "../../allCourses.types.ts";

function InstructorTab({ instructors }: { instructors: CourseDetailsPublic["courseInstructors"] }) {
  if (!instructors.length) {
    return (
      <div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center'>
        <GraduationCap className='mx-auto h-9 w-9 text-slate-400' />
        <h2 className='mt-3 font-bold text-slate-800'>Instructor information unavailable</h2>
      </div>
    );
  }

  return (
    <div className='space-y-5'>
      <div>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-orange-500'>Meet your instructor</p>
        <h2 className='mt-1 text-xl font-bold text-slate-900 sm:text-2xl'>Learn from experienced mentors</h2>
      </div>

      {instructors.map((instructor, index) => (
        <FadeIn key={`${instructor.instructorId}-${index}`} delay={index * 80}>
          <article className='rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-md sm:p-6'>
            <div className='flex flex-col gap-5 sm:flex-row'>
              <div className='relative mx-auto shrink-0 sm:mx-0'>
                <Link href={`/instructors/${instructor.userId}`} className='block'>
                  <div className='relative h-28 w-28 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 sm:h-32 sm:w-32'>
                    <Image
                      src={instructor.avatarUrl || "/default-avatar.png"}
                      alt={instructor.displayName}
                      fill
                      sizes='128px'
                      className='object-cover transition duration-300 hover:scale-105'
                    />
                  </div>
                </Link>
                <span className='absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border-4 border-white bg-[#074079] text-white'>
                  <Award className='h-4 w-4' />
                </span>
              </div>

              <div className='min-w-0 flex-1 text-center sm:text-left'>
                {instructor.expertise && (
                  <span className='inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600'>
                    {instructor.expertise}
                  </span>
                )}
                <Link href={`/instructors/${instructor.userId}`}>
                  <h3 className='mt-2 text-xl font-bold text-[#074079] transition hover:text-orange-600'>
                    {instructor.displayName}
                  </h3>
                </Link>

                <div className='mt-4 flex flex-wrap justify-center gap-2 sm:justify-start'>
                  <Stat icon={Users} value={`${instructor.totalStudents}`} label='Students' />
                  <Stat icon={BookOpen} value={`${instructor.totalCourses}`} label='Courses' />
                  <Stat icon={Star} value={Number(instructor.rating ?? 0).toFixed(1)} label='Rating' />
                </div>

                {instructor.bio && (
                  <p className='mt-4 text-sm leading-7 text-slate-600'>{instructor.bio}</p>
                )}
              </div>
            </div>
          </article>
        </FadeIn>
      ))}
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: string;
  label: string;
}) {
  return (
    <span className='inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600'>
      <Icon className='h-3.5 w-3.5 text-orange-500' />
      <strong className='text-slate-800'>{value}</strong> {label}
    </span>
  );
}

export default InstructorTab;
