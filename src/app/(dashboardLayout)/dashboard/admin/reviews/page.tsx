"use client";

import { Check, Flag, Trash2 } from "lucide-react";
import { Avatar, Badge, SectionHeader } from "../Components";
import { REVIEWS } from "../Data";

export default function ReviewsPage() {
  return (
    <div className='animate-[pageEnter_0.3s_ease-out]'>
      <SectionHeader
        title='Reviews & Ratings'
        sub='Moderate and manage all platform reviews'
      />

      {/* KPI Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-6'>
        {[
          { l: "Total Reviews", v: "8,420", text: "text-blue-400", border: "after:bg-blue-500" },
          {
            l: "Platform Rating",
            v: "4.8 ⭐",
            text: "text-amber-400",
            border: "after:bg-amber-500",
          },
          { l: "Reported", v: "14", text: "text-red-500", border: "after:bg-red-500" },
          { l: "Auto-Flagged", v: "7", text: "text-purple-400", border: "after:bg-purple-500" },
        ].map(s => (
          <div
            key={s.l}
            className={`bg-slate-900 border border-slate-800 rounded-2xl p-5.5 cursor-default transition-all duration-250 relative overflow-hidden group hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/40 after:absolute after:bottom-0 after:left-0 after:right-0 after:height-[2px] after:opacity-40 hover:after:opacity-100 after:transition-opacity ${s.border}`}
          >
            <div className={`font-['Syne'] text-[22px] font-bold mb-1 ${s.text}`}>{s.v}</div>
            <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500'>
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Reviews List Card */}
      <div className='bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
        {REVIEWS.map((r, i) => (
          <div
            key={r.id}
            className={`p-5 md:px-6 md:py-5 transition-colors ${
              i < REVIEWS.length - 1 ? "border-b border-slate-800" : ""
            } ${r.reported ? "bg-red-500/5" : ""}`}
          >
            {/* Review Header */}
            <div className='flex justify-between items-start mb-3'>
              <div className='flex gap-3 items-center'>
                <Avatar
                  name={r.student}
                  size={32}
                />
                <div>
                  <div className='font-semibold text-sm text-slate-100'>{r.student}</div>
                  <div className='text-xs text-slate-500'>
                    {r.course} · {r.date}
                  </div>
                </div>
              </div>
              <div className='flex gap-2 items-center'>
                {r.reported && <Badge variant='red'>🚩 Reported</Badge>}
                <div className='flex gap-0.5'>
                  {[1, 2, 3, 4, 5].map(s => (
                    <svg
                      key={s}
                      viewBox='0 0 24 24'
                      className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-amber-400" : "fill-slate-800"}`}
                    >
                      <path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Review Comment */}
            <p
              className={`text-[13.5px] text-slate-400 mb-3.5 leading-relaxed ${r.reported ? "italic" : ""}`}
            >
              {r.comment}
            </p>

            {/* Actions */}
            <div className='flex gap-2'>
              <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-['Outfit'] font-semibold text-xs transition-all cursor-pointer bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20">
                <Check
                  size={12}
                  className='text-emerald-400'
                />{" "}
                Approve
              </button>
              <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-['Outfit'] font-semibold text-xs transition-all cursor-pointer bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">
                <Trash2
                  size={12}
                  className='text-red-500'
                />{" "}
                Delete
              </button>
              {!r.reported && (
                <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-['Outfit'] font-semibold text-xs transition-all cursor-pointer bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-slate-100 hover:border-slate-700">
                  <Flag size={12} /> Flag
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
