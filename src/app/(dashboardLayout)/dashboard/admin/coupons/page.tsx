"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge, ProgressBar, SectionHeader } from "../Components";
import { COUPONS } from "../Data";

export default function CouponsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className='animate-page-enter'>
      <SectionHeader
        title='Coupons & Discounts'
        sub='Create and manage promotional campaigns'
        action={
          <button
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg font-['Outfit'] text-[13px] font-semibold transition-all bg-linear-to-br from-orange-500 to-orange-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/45 hover:-translate-y-px active:scale-95 cursor-pointer border-none"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus
              size={14}
              stroke='white'
            />{" "}
            New Coupon
          </button>
        }
      />

      {showForm && (
        <div className='relative overflow-hidden bg-slate-900 border border-orange-500/30 rounded-2xl p-6 mb-5 before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
          <div className="font-['Syne'] font-bold text-base text-slate-100 mb-5">
            Create New Coupon
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3.5'>
            {[
              ["Coupon Code", "text", "e.g. SAVE20"],
              ["Discount Value", "number", "e.g. 20"],
              ["Usage Limit", "number", "Blank = unlimited"],
            ].map(([l, t, p]) => (
              <div key={String(l)}>
                <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-1.5'>
                  {l}
                </div>
                <input
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 font-['Outfit'] outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder:text-slate-600"
                  type={String(t)}
                  placeholder={String(p)}
                />
              </div>
            ))}
            <div>
              <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-1.5'>
                Type
              </div>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 pr-9 text-sm text-slate-100 font-['Outfit'] outline-none cursor-pointer transition-all focus:border-orange-500 appearance-none bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2212%22_height=%228%22_viewBox=%220_0_12_8%22%3E%3Cpath_d=%22M1_1l5_5_5-5%22_stroke=%22%2364748b%22_stroke-width=%221.5%22_fill=%22none%22_stroke-linecap=%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center]">
                <option>Percentage</option>
                <option>Flat</option>
              </select>
            </div>
            <div>
              <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-1.5'>
                Expiry Date
              </div>
              <input
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 font-['Outfit'] outline-none transition-all focus:border-orange-500"
                type='date'
              />
            </div>
            <div>
              <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-1.5'>
                Scope
              </div>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 pr-9 text-sm text-slate-100 font-['Outfit'] outline-none cursor-pointer transition-all focus:border-orange-500 appearance-none bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2212%22_height=%228%22_viewBox=%220_0_12_8%22%3E%3Cpath_d=%22M1_1l5_5_5-5%22_stroke=%22%2364748b%22_stroke-width=%221.5%22_fill=%22none%22_stroke-linecap=%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center]">
                <option>Global</option>
                <option>Instructor-specific</option>
                <option>Referral</option>
              </select>
            </div>
          </div>
          <div className='flex gap-3 mt-4'>
            <button className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg font-['Outfit'] text-[13px] font-semibold transition-all bg-linear-to-br from-orange-500 to-orange-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/45 hover:-translate-y-px cursor-pointer border-none">
              Create Coupon
            </button>
            <button
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg font-['Outfit'] text-[13px] font-semibold transition-all bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700 cursor-pointer"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className='relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-b border-slate-800'>
                {["Code", "Type", "Discount", "Usage", "Scope", "Expires", "Status", "Actions"].map(
                  th => (
                    <th
                      key={th}
                      className='bg-slate-950 text-slate-500 text-[11px] font-semibold uppercase tracking-widest px-4.5 py-3.5 text-left font-mono'
                    >
                      {th}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-800/50'>
              {COUPONS.map(c => (
                <tr
                  key={c.code}
                  className='transition-colors hover:bg-slate-800/40 group'
                >
                  <td className='px-4.5 py-4 font-mono font-bold text-orange-500 text-sm'>
                    {c.code}
                  </td>
                  <td className='px-4.5 py-4'>
                    <Badge variant='blue'>{c.type}</Badge>
                  </td>
                  <td className='px-4.5 py-4 font-mono font-bold text-emerald-400'>{c.value}</td>
                  <td className='px-4.5 py-4'>
                    <div className='flex items-center gap-2 min-w-30'>
                      <ProgressBar value={c.limit ? (c.used / c.limit) * 100 : 50} />
                      <span className='font-mono text-[11px] text-slate-400 min-w-12'>
                        {c.used}/{c.limit ?? "∞"}
                      </span>
                    </div>
                  </td>
                  <td className='px-4.5 py-4'>
                    <Badge variant='gray'>{c.scope}</Badge>
                  </td>
                  <td className='px-4.5 py-4 font-mono text-xs text-slate-500'>{c.expires}</td>
                  <td className='px-4.5 py-4'>
                    <Badge variant={c.status === "Active" ? "green" : "red"}>{c.status}</Badge>
                  </td>
                  <td className='px-4.5 py-4'>
                    <div className='flex gap-2'>
                      <button className='inline-flex items-center gap-1.5 p-2 rounded-lg bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700 transition-all cursor-pointer'>
                        <Edit size={14} />
                      </button>
                      <button className='inline-flex items-center gap-1.5 p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer'>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
