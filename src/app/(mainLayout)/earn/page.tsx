"use client";

import InstructorRegistrationForm from "@/app/auth/instructor-signup/InstructorRegistrationForm.tsx";
import { useSessionContext } from "@/app/contexts/SessionContext";
import { ArrowDown, ArrowRight, BookOpen, CheckCircle2, GraduationCap, Users } from "lucide-react";
import Link from "next/link";

const opportunities = [
  {
    icon: GraduationCap,
    title: "Teach what you know",
    description: "Create courses around the skills and experience you want to share.",
  },
  {
    icon: BookOpen,
    title: "Publish your books",
    description: "Instructors can submit their own books for review and publication.",
  },
  {
    icon: Users,
    title: "Connect with learners",
    description: "Build your instructor profile and help learners grow through your content.",
  },
];

export default function EarnPage() {
  const { user, isLoading } = useSessionContext();
  const isInstructor = user?.role?.includes("INSTRUCTOR");

  return (
    <div className='min-w-0 px-4 pb-12 sm:px-6'>
      <section className='relative overflow-hidden rounded-3xl bg-[#172b30] px-6 py-12 text-white sm:px-10 lg:py-16'>
        <div className='pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl' />
        <div className='relative max-w-2xl'>
          <span className='inline-flex rounded-full border border-orange-300/30 bg-orange-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-200'>
            Earn with AloSkill
          </span>
          <h1 className='mt-5 text-3xl font-extrabold leading-tight sm:text-4xl'>
            Share your expertise. Grow as an instructor.
          </h1>
          <p className='mt-4 max-w-xl text-sm leading-7 text-slate-200 sm:text-base'>
            Teach learners through courses, publish your own books, and build your presence on
            AloSkill. Start by applying to become an instructor.
          </p>
          <a
            href='#instructor-application'
            className='mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600'
          >
            {isInstructor ? "Your instructor dashboard" : "Become an instructor"}{" "}
            <ArrowDown className='h-4 w-4' />
          </a>
        </div>
      </section>

      <section
        aria-labelledby='opportunities-heading'
        className='mx-auto max-w-5xl py-12'
      >
        <div className='mb-6'>
          <p className='text-xs font-bold uppercase tracking-widest text-orange-600'>
            Your opportunities
          </p>
          <h2
            id='opportunities-heading'
            className='mt-2 text-2xl font-bold text-slate-900'
          >
            Create and share on AloSkill
          </h2>
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          {opportunities.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
            >
              <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600'>
                <Icon className='h-5 w-5' />
              </div>
              <h3 className='font-bold text-slate-900'>{title}</h3>
              <p className='mt-2 text-sm leading-6 text-slate-600'>{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id='instructor-application'
        aria-labelledby='application-heading'
        className='mx-auto max-w-5xl scroll-mt-32 rounded-3xl border border-orange-100 bg-orange-50/60 px-4 py-8 sm:px-8 sm:py-10'
      >
        <div className='mx-auto mb-7 max-w-3xl'>
          <p className='text-xs font-bold uppercase tracking-widest text-orange-600'>Get started</p>
          <h2
            id='application-heading'
            className='mt-2 text-2xl font-bold text-slate-900'
          >
            Your instructor journey starts here
          </h2>
          <div className='mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600'>
            <span className='inline-flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-orange-500' /> Complete your application
            </span>
            <span className='inline-flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-orange-500' /> Submit for review
            </span>
            <span className='inline-flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-orange-500' /> Create after approval
            </span>
          </div>
        </div>
        {!isLoading &&
          (isInstructor ? (
            <div className='mx-auto max-w-3xl rounded-2xl border border-orange-200 bg-white p-6 text-center'>
              <h3 className='text-lg font-bold text-slate-900'>You are already an instructor</h3>
              <p className='mt-2 text-sm text-slate-600'>
                Continue creating courses and managing your books from your dashboard.
              </p>
              <Link
                href='/dashboard/instructor'
                className='mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600'
              >
                Open instructor dashboard <ArrowRight className='h-4 w-4' />
              </Link>
            </div>
          ) : (
            <InstructorRegistrationForm embedded />
          ))}
      </section>
    </div>
  );
}
