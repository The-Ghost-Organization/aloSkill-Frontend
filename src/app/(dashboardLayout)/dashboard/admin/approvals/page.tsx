"use client";

import { Badge, SectionHeader } from "../Components";
import { APPROVALS } from "../Data";

const typeIcon: Record<string, string> = {
  "New Course": "📘",
  "New Instructor": "👤",
  "Book Approval": "📕",
  "Instructor KYC": "🔐",
  "Course Update": "✏️",
};

export default function ApprovalsPage() {
  return (
    /* Using the custom animation defined in global.css */
    <div className='animate-page-enter'>
      <SectionHeader
        title='Approval Workflow'
        sub={`${APPROVALS.length} items awaiting your review`}
      />

      <div className='flex flex-col gap-3'>
        {APPROVALS.map(item => (
          <div
            key={item.id}
            className={`
              relative overflow-hidden flex items-center gap-4 px-6 py-4.5 rounded-2xl border bg-slate-900 transition-all
              ${item.priority === "High" ? "border-red-500/25 shadow-lg shadow-red-500/5" : "border-slate-800"}
              before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none
            `}
          >
            {/* Icon Container */}
            <div className='flex shrink-0 items-center justify-center w-11.5 h-11.5 rounded-xl bg-slate-950 border border-slate-800 text-xl'>
              {typeIcon[item.type]}
            </div>

            {/* Content Area */}
            <div className='flex-1 min-w-0'>
              <div className='flex flex-wrap gap-2 items-center mb-1'>
                <Badge variant='blue'>{item.type}</Badge>
                {item.priority === "High" && <Badge variant='red'>🔴 High Priority</Badge>}
              </div>

              <div className='font-bold text-sm text-slate-100 mb-1'>{item.title}</div>

              <div className='text-xs text-slate-500 font-medium'>
                {item.by} · {item.date} · {item.id}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-wrap gap-2 shrink-0'>
              {/* Review Button (Ghost) */}
              <button className="inline-flex items-center px-4.5 py-2 rounded-lg font-['Outfit'] text-xs font-semibold cursor-pointer transition-all border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700">
                Review
              </button>

              {/* Approve Button (Success) */}
              <button className="inline-flex items-center px-4.5 py-2 rounded-lg font-['Outfit'] text-xs font-semibold cursor-pointer transition-all border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
                ✓ Approve
              </button>

              {/* Reject Button (Danger) */}
              <button className="inline-flex items-center px-4.5 py-2 rounded-lg font-['Outfit'] text-xs font-semibold cursor-pointer transition-all border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20">
                ✗ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
