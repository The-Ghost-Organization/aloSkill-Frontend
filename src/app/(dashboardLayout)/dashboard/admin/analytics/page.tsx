"use client";

import { Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CustomTooltip, SectionHeader } from "../Components";

const completionData = [
  { cat: "Dev", v: 74 },
  { cat: "Design", v: 68 },
  { cat: "Data", v: 81 },
  { cat: "Marketing", v: 55 },
  { cat: "Business", v: 63 },
];

const reports = [
  { name: "Instructor Revenue Report", size: "128 KB", updated: "Today" },
  { name: "Student Activity Report", size: "342 KB", updated: "Today" },
  { name: "Course Completion Report", size: "94 KB", updated: "Yesterday" },
  { name: "Payment Report", size: "216 KB", updated: "Today" },
  { name: "Coupon Usage Report", size: "48 KB", updated: "Feb 18" },
  { name: "Refund Analysis Report", size: "72 KB", updated: "Feb 17" },
];

export default function AnalyticsPage() {
  return (
    /* Using the custom animation defined in global.css */
    <div className='animate-page-enter'>
      <SectionHeader
        title='Analytics & Reports'
        sub='Deep insights and downloadable CSV reports'
        action={
          <div className='flex gap-3'>
            <button className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg font-['Outfit'] text-[13px] font-semibold cursor-pointer transition-all duration-150 bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-slate-100 hover:border-slate-700">
              <Download size={13} /> Export CSV
            </button>
            <button className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg font-['Outfit'] text-[13px] font-semibold cursor-pointer transition-all duration-150 border-none bg-linear-to-br from-orange-500 to-orange-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/45 hover:-translate-y-px">
              <Download
                size={13}
                color='white'
              />{" "}
              Export PDF
            </button>
          </div>
        }
      />

      <div className='grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6'>
        {reports.map(r => (
          <div
            key={r.name}
            className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-4 px-5 flex justify-between items-center before:content-[''] before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none"
          >
            <div>
              <div className='font-semibold text-[13px] text-slate-100 mb-1'>{r.name}</div>
              <div className='font-mono text-[11px] text-slate-500 uppercase tracking-tight'>
                {r.size} · {r.updated}
              </div>
            </div>
            <button className="shrink-0 inline-flex items-center gap-1.5 p-2 rounded-lg font-['Outfit'] cursor-pointer transition-all duration-150 bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700">
              <Download size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 before:content-[''] before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none">
        <div className="font-['Syne'] font-bold text-base text-slate-100 mb-1">
          Course Completion Rate by Category
        </div>
        <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-6'>
          Current month performance
        </div>

        <div className='h-60 w-full'>
          <ResponsiveContainer
            width='100%'
            height='100%'
          >
            <BarChart
              data={completionData}
              barSize={36}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#1e293b'
                vertical={false}
              />
              <XAxis
                dataKey='cat'
                tick={{ fontSize: 11, fill: "#64748b", fontFamily: "var(--font-dm-mono)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b", fontFamily: "var(--font-dm-mono)" }}
                axisLine={false}
                tickLine={false}
                unit='%'
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar
                dataKey='v'
                fill='#f97316'
                radius={[6, 6, 0, 0]}
                name='Completion %'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
