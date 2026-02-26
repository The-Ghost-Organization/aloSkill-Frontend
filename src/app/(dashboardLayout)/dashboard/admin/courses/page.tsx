"use client";

import { Archive, Eye, Home, Search } from "lucide-react";
import { useState } from "react";
import { Badge, ProgressBar, SectionHeader } from "../Components";
import { COURSES } from "../Data";

const statusV: Record<string, string> = {
  Approved: "green",
  Pending: "orange",
  Draft: "gray",
  Rejected: "red",
};

export default function CoursesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = COURSES.filter(c => {
    const m =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    return m && (statusFilter === "all" || c.status.toLowerCase() === statusFilter);
  });

  const counts = {
    all: COURSES.length,
    approved: COURSES.filter(c => c.status === "Approved").length,
    pending: COURSES.filter(c => c.status === "Pending").length,
    draft: COURSES.filter(c => c.status === "Draft").length,
    rejected: COURSES.filter(c => c.status === "Rejected").length,
  };

  return (
    <div className='animate-page-enter'>
      <SectionHeader
        title='Course Management'
        sub='Review, approve and curate all courses'
      />

      <div className='flex gap-3 mb-5 items-center flex-wrap'>
        {/* Tab Navigation */}
        <div className='flex gap-0.5 bg-slate-950 rounded-xl p-1 border border-slate-800 overflow-x-auto flex-nowrap scrollbar-hide'>
          {(["all", "approved", "pending", "draft", "rejected"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4.5 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all font-['Outfit'] whitespace-nowrap border ${
                statusFilter === s
                  ? "bg-slate-900 text-orange-400 border-orange-500/25 shadow-lg"
                  : "bg-transparent text-slate-500 border-transparent hover:text-slate-400"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}{" "}
              <span className='opacity-60 text-[11px]'>({counts[s]})</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className='relative'>
          <Search
            size={14}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'
          />
          <input
            className="w-56 bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-9 pr-3.5 text-sm text-slate-100 font-['Outfit'] outline-none transition-all focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10 placeholder:text-slate-500"
            placeholder='Search courses...'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Course Grid */}
      <div className='grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4'>
        {filtered.map(c => (
          <div
            key={c.id}
            className='group relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl transition-all hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-2xl before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'
          >
            {/* Header / Featured Ribbon */}
            <div className='bg-linear-to-br from-slate-950 to-slate-900 px-5 py-4 border-b border-slate-800 relative'>
              {c.featured && (
                <div className='absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg font-mono tracking-wider'>
                  FEATURED
                </div>
              )}
              <div className='flex justify-between items-center'>
                <Badge variant={statusV[c.status]}>{c.status}</Badge>
                <span className='font-mono text-[11px] text-slate-500'>{c.cat}</span>
              </div>
            </div>

            {/* Body */}
            <div className='p-5'>
              <div className="font-['Syne'] font-bold text-sm text-slate-100 mb-1 leading-snug">
                {c.title}
              </div>
              <div className='text-xs text-slate-500 mb-4'>by {c.instructor}</div>

              {/* Stats Grid */}
              <div className='grid grid-cols-4 gap-2 mb-3.5'>
                {[
                  { l: "Students", v: c.enr.toLocaleString() },
                  { l: "Revenue", v: c.rev ? `$${c.rev.toLocaleString()}` : "$0" },
                  { l: "Rating", v: c.rating || "—" },
                  { l: "Price", v: `$${c.price}` },
                ].map(s => (
                  <div
                    key={s.l}
                    className='text-center'
                  >
                    <div className='font-mono text-sm font-bold text-slate-100'>{s.v}</div>
                    <div className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mt-0.5'>
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Section */}
              {c.pct > 0 && (
                <div className='mb-3.5'>
                  <div className='flex justify-between mb-1'>
                    <span className='font-mono text-[10px] uppercase tracking-widest text-slate-500'>
                      Completion Rate
                    </span>
                    <span className='font-mono text-[11px] text-orange-400'>{c.pct}%</span>
                  </div>
                  <ProgressBar value={c.pct} />
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex gap-2 flex-wrap'>
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-['Outfit'] text-xs font-semibold transition-all bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700 cursor-pointer">
                  <Eye size={12} /> View
                </button>

                {c.status === "Pending" && (
                  <>
                    <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-['Outfit'] text-xs font-semibold transition-all bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer">
                      ✓ Approve
                    </button>
                    <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-['Outfit'] text-xs font-semibold transition-all bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 cursor-pointer">
                      ✗ Reject
                    </button>
                  </>
                )}

                {c.status === "Approved" && (
                  <>
                    <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-['Outfit'] text-xs font-semibold transition-all bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700 cursor-pointer">
                      <Home size={12} /> Feature
                    </button>
                    <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-['Outfit'] text-xs font-semibold transition-all bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700 cursor-pointer">
                      <Archive size={12} /> Archive
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
