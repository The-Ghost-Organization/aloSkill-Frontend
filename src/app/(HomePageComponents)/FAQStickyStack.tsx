"use client";

import { ArrowUpRight } from "lucide-react";

const faqs = [
  {
    id: "01",
    category: "Money",
    question: "Do you work on a fixed-price or hourly basis?",
    answer:
      "We prefer Fixed Price. It protects you from budget creep. We define the scope, set the price, and sticking to it.",
    color: "bg-emerald-500",
    bg: "bg-emerald-50 ",
    border: "border-emerald-200 ",
  },
  {
    id: "02",
    category: "Speed",
    question: "How long does it take to build an MVP?",
    answer:
      "Usually 4-6 weeks. We build the core features fast, ship it to real users, and then iterate based on data.",
    color: "bg-blue-500",
    bg: "bg-blue-50 ",
    border: "border-blue-200 ",
  },
  {
    id: "03",
    category: "Ownership",
    question: "Do I own the code and intellectual property?",
    answer:
      "100%. We are a 'work for hire' studio. Once the final invoice is paid, we transfer all assets to your organization.",
    color: "bg-violet-500",
    bg: "bg-violet-50 ",
    border: "border-violet-200 ",
  },
  {
    id: "04",
    category: "Support",
    question: "What happens if things break after launch?",
    answer:
      "You get a 30-day warranty included. Any bugs found in the first month are fixed for free.",
    color: "bg-rose-500",
    bg: "bg-rose-50 ",
    border: "border-rose-200 ",
  },
];

export default function FAQStickyStack() {
  return (
    <section className='relative bg-white py-2'>
      <div className='mx-auto max-w-5xl px-6'>
        {/* Header */}
        <div className='mb-24 md:text-center'>
          <h2 className='text-3xl font-bold tracking-tight text-slate-900 md:text-5xl '>
            Common <span className='text-slate-400'>Questions.</span>
          </h2>
          <p className='mt-2 text-lg text-slate-600 '>Scroll to uncover the details.</p>
        </div>

        {/* 1. Removed space-y-8 here */}
        <div className='relative'>
          {faqs.map((card, index) => (
            <div
              key={card.id}
              // 2. Removed top-0, added mb-12 for spacing during scroll
              className={`sticky mx-auto mb-12 flex w-full max-w-4xl flex-col gap-6 rounded-xl border-2 p-8 shadow-2xl transition-transform md:flex-row md:p-12 ${card.bg} ${card.border}`}
              style={{
                top: `${100 + index * 30}px`, // Increased offset for better visibility
                zIndex: index + 1, // Ensures later cards stay on top
              }}
            >
              {/* Left Column */}
              <div className='flex flex-row items-center justify-between gap-4 md:w-1/8 md:flex-col md:items-start md:justify-start'>
                <span className='font-mono text-2xl font-black text-slate-900/5 /5 md:text-8xl'>
                  {card.id}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white ${card.color}`}
                >
                  {card.category}
                </span>
              </div>

              {/* Right Column */}
              <div className='md:w-3/4 '>
                <h3 className='text-lg font-bold leading-tight text-slate-900  md:text-lg'>
                  {card.question}
                </h3>
                <p className='mt-6 text-md leading-relaxed text-slate-600 '>{card.answer}</p>
              </div>
            </div>
          ))}

          {/* Final CTA Card */}
          <div
            className='sticky mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-6 rounded-[2.5rem] bg-slate-900 p-12 text-center text-white shadow-2xl  '
            style={{
              top: `${100 + faqs.length * 30}px`,
              zIndex: faqs.length + 1,
            }}
          >
            <h3 className='text-3xl font-bold'>Have a different question?</h3>
            <p className='max-w-md text-slate-400 '>
              We&apos;re transparent about our process. Let&apos;s hop on a call and clear things up.
            </p>
            <a
              href='#contact'
              className='group mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-slate-900 transition hover:bg-slate-200  '
            >
              Contact Us
              <ArrowUpRight className='h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1' />
            </a>
          </div>
        </div>

        {/* Extra spacer to allow the last card to stick before the section ends */}
        <div className='h-[30vh]'></div>
      </div>
    </section>
  );
}
