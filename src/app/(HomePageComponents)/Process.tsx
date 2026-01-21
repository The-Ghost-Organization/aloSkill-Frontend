
"use client";

import { Code2, PenTool, Rocket, Search } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Strategy & Scope",
    desc: "We dive deep to map the technical blueprint and business KPIs.",
    icon: Search,
    color: "from-cyan-500 to-blue-500", // Start Cool
  },
  {
    id: "02",
    title: "UX/UI Design",
    desc: "High-fidelity prototypes that visualize the exact end-product.",
    icon: PenTool,
    color: "from-blue-500 to-violet-500", // Transition
  },
  {
    id: "03",
    title: "Development",
    desc: "Scalable, clean code built on modern stacks like Next.js.",
    icon: Code2,
    color: "from-violet-500 to-fuchsia-500", // Heat up
  },
  {
    id: "04",
    title: "Launch & Scale",
    desc: "Seamless deployment with analytics and performance monitoring.",
    icon: Rocket,
    color: "from-fuchsia-500 to-amber-500", // Victory
  },
];

export default function ProcessPerfect() {
  return (
    <section className='relative overflow-hidden bg-white py-24 '>
      <div className='mx-auto max-w-5xl px-6'>
        {/* Header */}
        <div className='mb-20 text-center'>
          <h2 className='text-3xl font-bold tracking-tight text-slate-900 md:text-5xl '>
            The Execution{" "}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-fuchsia-600'>
              Flow
            </span>
          </h2>
        </div>

        {/* ZIG-ZAG GRID LAYOUT 
          - Mobile: Single column, vertical connecting lines.
          - Desktop: Two columns, zig-zag SVG connectors.
        */}
        <div className='relative grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-32 md:gap-y-0'>
          {/* --- STEP 01 (Left) --- */}
          <div className='relative'>
            <ProcessCard step={steps[0]} />
            {/* Desktop Arrow: Right & Down */}
            <div className='absolute -right-32 top-1/2 hidden h-40 w-32 md:block'>
              <BezierCurve
                direction='right'
                color='text-blue-800'
              />
            </div>
            {/* Mobile Connector */}
            <MobileConnector />
          </div>

          {/* Spacer for Right Column on Desktop */}
          <div className='hidden md:block'></div>

          {/* Spacer for Left Column on Desktop */}
          <div className='hidden md:block'></div>

          {/* --- STEP 02 (Right) --- */}
          <div className='relative md:-mt-24'>
            <ProcessCard step={steps[1]} />
            {/* Desktop Arrow: Left & Down */}
            <div className='absolute -left-32 top-1/2 hidden h-40 w-32 md:block'>
              <BezierCurve
                direction='left'
                color='text-violet-500'
              />
            </div>
            {/* Mobile Connector */}
            <MobileConnector />
          </div>

          {/* --- STEP 03 (Left) --- */}
          <div className='relative md:-mt-24'>
            <ProcessCard step={steps[2]} />
            {/* Desktop Arrow: Right & Down */}
            <div className='absolute -right-32 top-1/2 hidden h-40 w-32 md:block'>
              <BezierCurve
                direction='right'
                color='text-fuchsia-500'
              />
            </div>
            {/* Mobile Connector */}
            <MobileConnector />
          </div>

          {/* Spacer for Right Column on Desktop */}
          <div className='hidden md:block'></div>
          <div className='hidden md:block'></div>

          {/* --- STEP 04 (Right) --- */}
          <div className='relative md:-mt-24'>
            <ProcessCard step={steps[3]} />
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Components ---

function ProcessCard({ step }: { step: any }) {
  return (
    <div className='group relative z-10 h-full rounded-xl border border-slate-200 bg-white/50 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-transparent hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ]'>
      {/* Hover Gradient Border (Optional sleek effect) */}
      <div
        className={`absolute inset-0 -z-10 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br ${step.color} p-[1px]`}
      >
        <div className='h-full w-full rounded-xl bg-white ' />
      </div>

      <div className='flex items-center justify-between gap-4'>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-white shadow-lg shadow-black/5`}
        >
          <step.icon className='h-6 w-6' />
        </div>
        <span className='text-6xl font-black text-slate-100 '>{step.id}</span>
      </div>

      <div className='mt-6'>
        <h3 className='text-lg font-bold text-slate-900 '>{step.title}</h3>
        <p className='mt-2 leading-relaxed text-slate-600 '>{step.desc}</p>
      </div>
    </div>
  );
}

/**
 * Mobile Vertical Connector
 */
function MobileConnector() {
  return (
    <div className='absolute -bottom-12 left-1/2 h-12 w-px -translate-x-1/2 md:hidden'>
      <div className='h-full w-full bg-gradient-to-b from-slate-300 to-transparent '></div>
    </div>
  );
}

/**
 * The Perfected Bezier Curve (Desktop)
 * Connects the side of one card to the top of the next in a smooth 'S'
 */
function BezierCurve({ direction, color }: { direction: "left" | "right"; color: string }) {
  const isRight = direction === "right";

  // Logic:
  // If Right: Start at top-left (0,0), Curve out to right, End at bottom-right (w, h)
  // If Left: Start at top-right (w,0), Curve out to left, End at bottom-left (0, h)

  return (
    <svg
      className={`h-full w-full overflow-visible ${color}`}
      viewBox='0 0 100 100'
      fill='none'
    >
      <defs>
        <marker
          id={`arrow-${direction}`}
          markerWidth='10'
          markerHeight='10'
          refX='5'
          refY='5'
          orient='auto'
        >
          <path
            d='M0 0L10 5L0 10V0Z'
            fill='currentColor'
          />
        </marker>
      </defs>

      <path
        d={isRight ? "M 0 20 C 60 20, 60 20, 100 80" : "M 100 20 C 40 20, 40 20, 0 80"}
        stroke='currentColor'
        strokeWidth='2'
        strokeDasharray='8 8'
        fill='none'
        markerEnd={`url(#arrow-${direction})`}
        className='opacity-40'
      />

      {/* Animated Overlay for Flow */}
      <path
        d={isRight ? "M 0 20 C 60 20, 60 20, 100 80" : "M 100 20 C 40 20, 40 20, 0 80"}
        stroke='currentColor'
        strokeWidth='2'
        strokeDasharray='8 8'
        fill='none'
        className='animate-flow-march'
      />

      <style jsx>{`
        .animate-flow-march {
          animation: flowMarch 1.5s linear infinite;
        }
        @keyframes flowMarch {
          from {
            stroke-dashoffset: 16;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </svg>
  );
}
