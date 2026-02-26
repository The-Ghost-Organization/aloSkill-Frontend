"use client";

import { useState } from "react";
import { Badge, SectionHeader } from "../Components";

const history = [
  {
    title: "February Newsletter",
    type: "Email",
    sent: "Feb 15",
    recipients: "14,820",
    opens: "8,240",
  },
  {
    title: "New Course: Python AI",
    type: "Push",
    sent: "Feb 12",
    recipients: "9,400",
    opens: "3,180",
  },
  {
    title: "Maintenance Notice",
    type: "In-App",
    sent: "Feb 10",
    recipients: "14,820",
    opens: "14,820",
  },
  {
    title: "Instructor Payout Week",
    type: "Email",
    sent: "Feb 7",
    recipients: "348",
    opens: "302",
  },
];

export default function NotificationsPage() {
  const [channel, setChannel] = useState("email");

  return (
    <div className='animate-[pageEnter_0.3s_ease-out]'>
      <SectionHeader
        title='Notification Center'
        sub='Send broadcasts, alerts and custom notifications'
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        {/* Compose Section */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
          <div className="font-['Syne'] font-bold text-[15px] text-slate-100 mb-5">
            Compose & Send
          </div>

          <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-2'>
            Channel
          </div>
          <div className='flex gap-2 mb-4'>
            {[
              ["email", "✉️ Email"],
              ["push", "📱 Push"],
              ["in-app", "🔔 In-App"],
            ].map(([id, label]) => (
              <button
                key={id}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  channel === id
                    ? "bg-linear-to-br from-orange-500 to-orange-700 text-white shadow-lg shadow-orange-500/20"
                    : "bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-100"
                }`}
                onClick={() => setChannel(id as string)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className='mb-3.5'>
            <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-2'>
              Target Audience
            </div>
            <select className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[13.5px] text-slate-100 outline-none w-full appearance-none bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2212%22_height=%228%22_viewBox=%220_0_12_8%22%3E%3Cpath_d=%22M1_1l5_5_5-5%22_stroke=%22%233d5a80%22_stroke-width=%221.5%22_fill=%22none%22_stroke-linecap=%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-9 focus:border-orange-500 transition-colors">
              <option>All Users</option>
              <option>All Students</option>
              <option>All Instructors</option>
              <option>Specific User</option>
            </select>
          </div>

          {channel === "email" && (
            <div className='mb-3.5'>
              <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-2'>
                Subject Line
              </div>
              <input
                className='bg-slate-950 border border-slate-800 rounded-lg p-3 text-[13.5px] text-slate-100 placeholder-slate-600 outline-none w-full focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10 transition-all'
                placeholder='Enter email subject...'
              />
            </div>
          )}

          <div className='mb-4'>
            <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-2'>
              Message
            </div>
            <textarea
              className='bg-slate-950 border border-slate-800 rounded-lg p-3 text-[13.5px] text-slate-100 placeholder-slate-600 outline-none w-full resize-none focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10 transition-all'
              rows={4}
              placeholder='Write your notification...'
            />
          </div>

          <div className='flex gap-3'>
            <button className='flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-linear-to-br from-orange-500 to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-px transition-all cursor-pointer'>
              Send Now
            </button>
            <button className='inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-transparent text-slate-400 border border-slate-800 font-semibold hover:bg-slate-800 hover:text-slate-100 transition-all cursor-pointer'>
              Schedule
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
          <div className="font-['Syne'] font-bold text-[15px] text-slate-100 mb-5">
            Recent Broadcasts
          </div>
          <div className='flex flex-col gap-2.5'>
            {history.map(h => (
              <div
                key={h.title}
                className='bg-slate-950 border border-slate-800 rounded-xl p-3.5 transition-colors hover:border-slate-700'
              >
                <div className='flex justify-between items-center mb-2'>
                  <div className='font-semibold text-[13px] text-slate-100'>{h.title}</div>
                  <Badge
                    variant={h.type === "Email" ? "blue" : h.type === "Push" ? "orange" : "green"}
                  >
                    {h.type}
                  </Badge>
                </div>
                <div className='flex gap-4'>
                  <span className='font-mono text-[11px] text-slate-500'>📅 {h.sent}</span>
                  <span className='font-mono text-[11px] text-slate-500'>👥 {h.recipients}</span>
                  <span className='font-mono text-[11px] text-slate-500'>👁 {h.opens} opens</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
