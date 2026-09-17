"use client";

import { Badge, SectionHeader, Toggle } from "../Components";

const logs = [
  {
    admin: "Super Admin",
    action: "Approved instructor: James Carter",
    time: "Feb 19 · 10:24 AM",
    ip: "103.211.x.x",
  },
  {
    admin: "Finance Admin",
    action: "Processed payout: $3,200 → Ravi Patel",
    time: "Feb 19 · 9:42 AM",
    ip: "202.134.x.x",
  },
  {
    admin: "Moderator",
    action: "Deleted spam review on Full-Stack Bootcamp",
    time: "Feb 18 · 4:17 PM",
    ip: "119.18.x.x",
  },
  {
    admin: "Super Admin",
    action: "IP blocked: 45.93.201.xxx",
    time: "Feb 18 · 2:05 PM",
    ip: "103.211.x.x",
  },
  {
    admin: "Finance Admin",
    action: "Rejected refund REF-003 (fraud flagged)",
    time: "Feb 18 · 11:30 AM",
    ip: "202.134.x.x",
  },
];

export default function SecurityPage() {
  return (
    <div className='animate-[pageEnter_0.3s_ease-out]'>
      <SectionHeader
        title='Security & Control'
        sub='Roles, permissions, audit logs and fraud detection'
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5'>
        {/* Admin Roles Section */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
          <div className="font-['Syne'] font-bold text-[15px] text-slate-100 mb-5">Admin Roles</div>
          <div className='space-y-2.5'>
            {[
              { role: "Super Admin", perms: "Full Access", text: "text-red-500", admins: 1 },
              {
                role: "Finance Admin",
                perms: "Financial Only",
                text: "text-orange-500",
                admins: 2,
              },
              {
                role: "Moderator",
                perms: "Content & Reviews",
                text: "text-emerald-400",
                admins: 3,
              },
            ].map(r => (
              <div
                key={r.role}
                className='bg-slate-950 border border-slate-800 rounded-xl p-3.5 px-4 flex justify-between items-center'
              >
                <div>
                  <div className={`font-bold text-sm ${r.text}`}>{r.role}</div>
                  <div className='font-mono text-[11px] text-slate-500 mt-0.5'>{r.perms}</div>
                </div>
                <div className='flex gap-2 items-center'>
                  <Badge variant='gray'>
                    {r.admins} admin{r.admins > 1 ? "s" : ""}
                  </Badge>
                  <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-['Outfit'] font-semibold text-[11px] transition-all cursor-pointer bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-100">
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-linear-to-br from-orange-500 to-orange-700 text-white font-['Outfit'] font-semibold text-[13px] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/45 hover:-translate-y-px transition-all cursor-pointer">
            + Add Admin
          </button>
        </div>

        {/* Security Controls Section */}
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
          <div className="font-['Syne'] font-bold text-[15px] text-slate-100 mb-5">
            Security Controls
          </div>
          <div className='divide-y divide-slate-800'>
            {[
              ["Two-Factor Authentication", "Required for all admins", true],
              ["IP Blocking", "Block suspicious IP addresses", true],
              ["AI Fraud Detection", "Monitor unusual transactions", true],
              ["Login Attempt Limit", "Lock after 5 failed attempts", true],
              ["Activity Logging", "Full audit trail", true],
            ].map(([l, s, on]) => (
              <div
                key={String(l)}
                className='flex justify-between items-center py-3'
              >
                <div>
                  <div className='font-semibold text-[13px] text-slate-100'>{l}</div>
                  <div className='text-[11px] text-slate-500 mt-0.5'>{s}</div>
                </div>
                <Toggle on={Boolean(on)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Log Section */}
      <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
        <div className="font-['Syne'] font-bold text-[15px] text-slate-100 mb-5">
          Activity Audit Log
        </div>
        <div className='divide-y divide-slate-800'>
          {logs.map((l, i) => (
            <div
              key={i}
              className='flex gap-4 py-3.5'
            >
              <div className='w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5 shadow-[0_0_6px_rgba(249,115,22,0.5)]' />
              <div className='flex-1'>
                <div className='text-[13px] text-slate-100'>
                  <span className='font-bold text-orange-400'>{l.admin}</span> — {l.action}
                </div>
                <div className='font-mono text-[11px] text-slate-500 mt-0.5'>
                  {l.time} · IP: {l.ip}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
