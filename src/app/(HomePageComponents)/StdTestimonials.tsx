"use client";

import SectionMiddleHeader from "@/components/sections/SectionMiddleHeader.tsx";
import { API_ENDPOINTS, apiClient } from "@/lib/api/client.ts";
import { ArrowUpRight, CheckCircle2, Quote, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type CourseTestimonial = {
  id: string;
  courseId: string | null;
  courseTitle: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  userDisplayName: string;
  avatarUrl: string | null;
  verifiedEnrollment: boolean;
};

export default function StdTestimonials() {
  const [testimonials, setTestimonials] = useState<CourseTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadTestimonials = async () => {
      try {
        const response = await apiClient.get<CourseTestimonial[]>(
          `${API_ENDPOINTS.COURSE.PUBLIC_TESTIMONIALS}?limit=6`
        );
        if (!cancelled && response.success) {
          setTestimonials(response.data ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadTestimonials();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && testimonials.length === 0) return null;

  return (
    <section className='relative overflow-hidden bg-slate-50 py-24'>
      <div className='absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]' />
      <div className='absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/2 translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-[120px]' />

      <div className='relative mx-auto max-w-7xl px-6'>
        <div className='mb-20'>
          <SectionMiddleHeader
            badge='What Our Learners Say'
            title='Real stories from '
            color_title='learners'
            subtitle='Verified feedback from learners who enrolled in AloSkill courses.'
          />
        </div>

        {loading ? (
          <div className='columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 lg:gap-8'>
            {[1, 2, 3, 4, 5, 6].map(item => (
              <div
                key={item}
                className='h-64 break-inside-avoid animate-pulse rounded-lg border border-slate-200 bg-white'
              />
            ))}
          </div>
        ) : (
          <div className='columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 lg:gap-8'>
            {testimonials.map((testimonial, index) => {
              const highlighted = index === 0 || index === 3;
              return (
                <div
                  key={testimonial.id}
                  className={`break-inside-avoid rounded-lg p-1 ${
                    highlighted
                      ? "bg-linear-to-br from-indigo-500 via-fuchsia-500 to-pink-500"
                      : "bg-transparent"
                  }`}
                >
                  <article
                    className={`relative h-full overflow-hidden rounded-lg border bg-white p-8 transition-shadow hover:shadow-xl ${
                      highlighted ? "border-transparent" : "border-slate-200"
                    }`}
                  >
                    {highlighted && (
                      <div className='absolute -right-4 -top-4 h-24 w-24 rounded-lg bg-indigo-500/10 blur-xl' />
                    )}

                    <div className='mb-5 flex items-center justify-between gap-4'>
                      <Quote
                        className={`h-8 w-8 ${highlighted ? "text-indigo-500" : "text-slate-300"}`}
                      />
                      <div
                        className='flex items-center gap-0.5'
                        aria-label={`${testimonial.rating} out of 5 stars`}
                      >
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= testimonial.rating ? "fill-orange-400 text-orange-400" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                    </div>

                    {testimonial.title && (
                      <h3 className='mb-2 text-base font-bold text-slate-900'>
                        {testimonial.title}
                      </h3>
                    )}
                    <p className='relative z-10 text-md font-medium leading-relaxed text-slate-600'>
                      {testimonial.body}
                    </p>

                    <div className='my-8 h-px w-full bg-slate-100' />

                    <div className='flex items-center gap-4'>
                      <div className='relative h-12 w-12 overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-100'>
                        <Image
                          src={testimonial.avatarUrl || "/default-avatar.png"}
                          alt={testimonial.userDisplayName}
                          fill
                          sizes='48px'
                          className='object-cover'
                        />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-1.5 font-bold text-slate-900'>
                          <span className='truncate'>{testimonial.userDisplayName}</span>
                          {testimonial.verifiedEnrollment && (
                            <CheckCircle2
                              className='h-4 w-4 shrink-0 text-emerald-500'
                              aria-label='Verified learner'
                            />
                          )}
                        </div>
                        {testimonial.courseId ? (
                          <Link
                            href={`/courses/${testimonial.courseId}`}
                            className='mt-0.5 block truncate text-sm text-slate-500 transition hover:text-orange-600'
                          >
                            {testimonial.courseTitle || "AloSkill course"}
                          </Link>
                        ) : (
                          <div className='mt-0.5 truncate text-sm text-slate-500'>
                            AloSkill learner
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}

            <div className='break-inside-avoid rounded-lg bg-slate-900 p-8 text-white shadow-2xl'>
              <div className='mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20'>
                <TrendingUp className='h-4 w-4 text-white' />
              </div>
              <h3 className='text-xl font-bold text-white'>
                Learn something valuable with AloSkill?
              </h3>
              <p className='mt-3 text-sm leading-6 text-slate-300'>
                Enroll in a course and share your verified experience from its Reviews tab.
              </p>
              <Link
                href='/courses'
                className='group mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-bold text-slate-900 transition hover:bg-indigo-50'
              >
                Browse Courses
                <ArrowUpRight className='h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1' />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
