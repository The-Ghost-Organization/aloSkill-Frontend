"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { SectionHeader, Toggle } from "../Components";

const radarData = [
  { s: "Rating", v: 90 },
  { s: "Revenue", v: 85 },
  { s: "Completion", v: 72 },
  { s: "Feedback", v: 88 },
  { s: "Activity", v: 78 },
];

// Mapped to Tailwind classes instead of hex codes
const badgeRules = [
  {
    badge: "Gold",
    text: "text-amber-400",
    border: "border-amber-400/20",
    criteria: "Rating ≥ 4.5 · Revenue ≥ $5K · Completion ≥ 70%",
  },
  {
    badge: "Platinum",
    text: "text-purple-400",
    border: "border-purple-400/20",
    criteria: "Rating ≥ 4.8 · Revenue ≥ $20K · Completion ≥ 85%",
  },
  {
    badge: "Premium",
    text: "text-orange-500",
    border: "border-orange-500/20",
    criteria: "Manual admin assignment only",
  },
];

export default function BadgesPage() {
  return (
    <div className='animate-page-enter'>
      <SectionHeader
        title='Badges & Ranking System'
        sub='Configure automated badge assignment and performance criteria'
      />

      {/* Two Column Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5'>
        {/* Badge Rules Card */}
        <div className='relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
          <div className="font-['Syne'] font-bold text-[15px] text-slate-100 mb-5">Badge Rules</div>

          {badgeRules.map(b => (
            <div
              key={b.badge}
              className={`p-4 rounded-xl bg-slate-950 mb-3 border ${b.border}`}
            >
              <div className='flex justify-between items-center mb-2'>
                <div className={`font-bold text-sm ${b.text}`}>🏅 {b.badge} Badge</div>
                <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-['Outfit'] text-xs font-semibold transition-all bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-slate-100 hover:border-slate-700 cursor-pointer">
                  Edit
                </button>
              </div>
              <div className='font-mono text-xs text-slate-400'>{b.criteria}</div>
            </div>
          ))}

          <button className="w-full flex justify-center items-center gap-1.5 px-4.5 py-2.5 rounded-lg font-['Outfit'] text-[13px] font-semibold transition-all mt-2 bg-linear-to-br from-orange-500 to-orange-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/45 hover:-translate-y-px cursor-pointer border-none">
            + Add Badge Rule
          </button>
        </div>

        {/* Radar Card */}
        <div className='relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
          <div className="font-['Syne'] font-bold text-[15px] text-slate-100 mb-1">
            Instructor Score Radar
          </div>
          <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-4'>
            James Carter — Platinum
          </div>

          <div className='h-50 w-full'>
            <ResponsiveContainer
              width='100%'
              height='100%'
            >
              <RadarChart data={radarData}>
                <PolarGrid stroke='#1e293b' /> {/* slate-800 */}
                <PolarAngleAxis
                  dataKey='s'
                  tick={{ fontSize: 11, fill: "#64748b", fontFamily: "var(--font-dm-mono)" }}
                />
                <Radar
                  dataKey='v'
                  stroke='#f97316' // orange-500
                  fill='#f97316'
                  fillOpacity={0.15}
                  strokeWidth={2}
                  name='Score'
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a", // slate-900
                    border: "1px solid #1e293b", // slate-800
                    borderRadius: "12px",
                    color: "#f1f5f9", // slate-100
                    fontSize: "12px",
                    fontFamily: "var(--font-outfit)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Automation Controls Card */}
      <div className='relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
        <div className="font-['Syne'] font-bold text-[15px] text-slate-100 mb-5">
          Automation Controls
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3.5'>
          {[
            ["Auto Badge Upgrade", "Upgrade when criteria met", true],
            ["Auto Badge Downgrade", "Downgrade on performance drop", true],
            ["Manual Override", "Admin can override automation", true],
          ].map(([l, s, on]) => (
            <div
              key={String(l)}
              className='bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-start hover:border-slate-700 transition-colors'
            >
              <div>
                <div className='font-semibold text-[13px] text-slate-100 mb-1'>{l}</div>
                <div className='text-[11px] text-slate-500'>{s}</div>
              </div>
              <Toggle on={Boolean(on)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
