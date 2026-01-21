"use client";

import SectionHeader from "@/components/sections/SectionHeader.tsx";
import { ArrowUpRight, Quote, TrendingUp } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    content:
      "We were drowning in technical debt. They didn't just patch the holes; they rebuilt our entire infrastructure. Our load times dropped by 60% overnight.",
    author: "Alex Rivera",
    role: "CTO @ FinTech Global",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100",
    metric: "60% Faster Load Time",
    highlight: true, // This card will be larger/distinct
  },
  {
    content:
      "The design system they built allowed us to ship features 3x faster. It's not just a pretty UI; it's a productivity engine.",
    author: "Sarah Chen",
    role: "Product Lead @ Nexus",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100",
    metric: "3x Dev Speed",
  },
  {
    content:
      "I was skeptical about the timeline, but they delivered the MVP two weeks early. The code quality is impeccable.",
    author: "Marcus Johnson",
    role: "Founder @ SaaSify",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100",
    metric: null,
  },
  {
    content:
      "Our conversion rate jumped from 1.2% to 4.5% after the redesign. The ROI on this project was achieved in month one.",
    author: "Emily Davis",
    role: "CMO @ GrowthLabs",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100",
    metric: "+275% Conversion",
    highlight: true,
  },
  {
    content:
      "Professional, transparent, and insanely talented. They feel like an extension of our internal team rather than an agency.",
    author: "David Kim",
    role: "VP of Engineering",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
    metric: null,
  },
];

export default function StdTestimonials() {
  return (
    <section className='relative overflow-hidden bg-slate-50 py-24 '>
      {/* Background Decorative Gradients */}
      <div className='absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px] ' />
      <div className='absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/2 translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-[120px] ' />

      <div className='mx-auto max-w-7xl px-6'>
        {/* Header */}
        <div className='mb-20 max-w-3xl'>
          <SectionHeader
            title='Results that speak for themselves.'
            badge='Student Testimonials'
          />
          {/* <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-600 shadow-sm '>
            <Star className='h-3 w-3 fill-current' />
            Client Outcomes
          </div>
          <h2 className='text-4xl font-bold tracking-tight text-slate-900 md:text-6xl '>
            Results that <br />
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-600'>
              speak for themselves.
            </span>
          </h2> */}
        </div>

        {/* Masonry Grid Layout */}
        <div className='columns-1 gap-6 md:columns-2 lg:columns-3 lg:gap-8 space-y-6'>
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className={`break-inside-avoid rounded-lg p-1 ${
                t.highlight
                  ? "bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500"
                  : "bg-transparent"
              }`}
            >
              <div
                className={`relative h-full overflow-hidden rounded-lg border bg-white p-8 transition-shadow hover:shadow-xl  ${
                  t.highlight ? "border-transparent" : "border-slate-200 "
                }`}
              >
                {/* Background Pattern for Highlighted Cards */}
                {t.highlight && (
                  <div className='absolute -right-4 -top-4 h-24 w-24 rounded-lg bg-indigo-500/10 blur-xl ' />
                )}

                {/* Quote Icon */}
                <Quote
                  className={`mb-6 h-8 w-8 ${t.highlight ? "text-indigo-500" : "text-slate-300 "}`}
                />

                {/* The Review Text */}
                <p
                  className={`relative z-10 text-md font-medium leading-relaxed ${
                    t.highlight ? "text-slate-900 " : "text-slate-600 "
                  }`}
                >
                  {t.content}
                </p>

                {/* Metric Badge (If available) */}
                {t.metric && (
                  <div className='mt-6 inline-flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-1.5 text-sm font-bold text-green-700  '>
                    <TrendingUp className='h-4 w-4' />
                    {t.metric}
                  </div>
                )}

                <div className='my-8 h-px w-full bg-slate-100 ' />

                {/* Author Info */}
                <div className='flex items-center gap-4'>
                  <div className='relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-slate-100 '>
                    <Image
                      src={
                        t.author === "Alex Rivera"
                          ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100"
                          : t.image
                      }
                      alt={t.author}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div>
                    <div className='font-bold text-slate-900 '>{t.author}</div>
                    <div className='text-sm text-slate-500 '>{t.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* CTA Card injected into the grid */}
          <div className='break-inside-avoid rounded-lg bg-slate-900 p-8 text-white shadow-2xl '>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 mb-6 '>
              <TrendingUp className='h-6 w-6 text-white ' />
            </div>
            <h3 className='text-2xl font-bold'>Ready to be our next success story?</h3>
            <p className='mt-2 text-slate-400 '>Join the companies scaling with our tech.</p>
            <button className='group mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-4 text-sm font-bold text-slate-900 transition hover:bg-indigo-50 '>
              Start Project
              <ArrowUpRight className='h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1' />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
