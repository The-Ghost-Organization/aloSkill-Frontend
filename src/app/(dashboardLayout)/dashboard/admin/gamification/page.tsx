"use client";

import { Plus } from "lucide-react";
import { Avatar, Badge, SectionHeader } from "../Components";

const leaderboard = [
  { rank: 1, name: "Fatima Al-Hassan", pts: 4820, streak: 42, medal: "🥇" },
  { rank: 2, name: "Priya Sharma", pts: 4210, streak: 38, medal: "🥈" },
  { rank: 3, name: "Yuki Tanaka", pts: 3940, streak: 31, medal: "🥉" },
  { rank: 4, name: "Aisha Rahman", pts: 3480, streak: 28, medal: "🎖️" },
  { rank: 5, name: "Carlos Mendez", pts: 2100, streak: 14, medal: "🎖️" },
];

const achievements = [
  { name: "First Course", icon: "🌱", desc: "Complete first course", pts: 100 },
  { name: "Speed Learner", icon: "⚡", desc: "Finish course in under 3 days", pts: 250 },
  { name: "Perfect Score", icon: "💯", desc: "Score 100% on any quiz", pts: 300 },
  { name: "7-Day Streak", icon: "🔥", desc: "Learn 7 days in a row", pts: 200 },
  { name: "Top Reviewer", icon: "⭐", desc: "Write 10 helpful reviews", pts: 150 },
];

const stats = [
  {
    l: "Active Streaks",
    v: "3,240",
    icon: "🔥",
    text: "text-orange-500",
    border: "hover:border-orange-500/50",
  },
  {
    l: "Achievements Earned",
    v: "18,420",
    icon: "🏆",
    text: "text-amber-400",
    border: "hover:border-amber-400/50",
  },
  {
    l: "Points Redeemed",
    v: "124,800",
    icon: "⭐",
    text: "text-purple-400",
    border: "hover:border-purple-400/50",
  },
  {
    l: "Daily Active",
    v: "2,840",
    icon: "⚡",
    text: "text-blue-400",
    border: "hover:border-blue-400/50",
  },
];

export default function GamificationPage() {
  return (
    <div className='animate-[pageEnter_0.3s_ease-out]'>
      <SectionHeader
        title='Gamification'
        sub='Leaderboards, points, achievements and rewards'
      />

      {/* KPI Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6'>
        {stats.map(s => (
          <div
            key={s.l}
            className={`bg-slate-900 border border-slate-800 rounded-2xl p-5.5 text-center transition-all duration-250 relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/40 ${s.border}`}
          >
            <div className='text-3xl mb-2'>{s.icon}</div>
            <div className={`font-['Syne'] text-2xl font-bold ${s.text}`}>{s.v}</div>
            <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mt-1'>
              {s.l}
            </div>
            {/* Bottom Accent Line */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-0.5 bg-current opacity-40 group-hover:opacity-100 transition-opacity ${s.text}`}
            />
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        {/* Leaderboard Card */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
          <div className="font-['Syne'] font-bold text-[15px] text-slate-100 mb-5">
            🏆 Student Leaderboard
          </div>
          <div className='flex flex-col'>
            {leaderboard.map((s, i) => (
              <div
                key={s.rank}
                className={`flex items-center gap-4 py-3 ${i < leaderboard.length - 1 ? "border-b border-slate-800/60" : ""}`}
              >
                <div className='text-xl w-7 text-center'>{s.medal}</div>
                <Avatar
                  name={s.name}
                  size={32}
                />
                <div className='flex-1'>
                  <div className='font-semibold text-[13px] text-slate-100'>{s.name}</div>
                  <div className='font-mono text-[11px] text-slate-500'>
                    🔥 {s.streak}-day streak
                  </div>
                </div>
                <div className='font-mono font-bold text-sm text-orange-500'>
                  {s.pts.toLocaleString()} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Card */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
          <div className='flex justify-between items-center mb-5'>
            <div className="font-['Syne'] font-bold text-[15px] text-slate-100">
              🎯 Achievements
            </div>
            <button className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-linear-to-br from-orange-500 to-orange-700 text-white text-xs font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-px transition-all cursor-pointer'>
              <Plus
                size={12}
                className='text-white'
              />{" "}
              Add
            </button>
          </div>
          <div className='flex flex-col'>
            {achievements.map((a, i) => (
              <div
                key={a.name}
                className={`flex items-center gap-3 py-2.5 ${i < achievements.length - 1 ? "border-b border-slate-800/60" : ""}`}
              >
                <div className='text-2xl'>{a.icon}</div>
                <div className='flex-1'>
                  <div className='font-semibold text-[13px] text-slate-100'>{a.name}</div>
                  <div className='text-[11px] text-slate-500'>{a.desc}</div>
                </div>
                <Badge variant='gold'>+{a.pts} pts</Badge>
                <button className='px-2 py-1 text-[11px] font-semibold text-slate-400 border border-slate-800 rounded-md hover:bg-slate-800 hover:text-slate-100 transition-colors cursor-pointer'>
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
