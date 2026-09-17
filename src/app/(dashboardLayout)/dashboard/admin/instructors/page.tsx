"use client";

import { DollarSign, Eye } from "lucide-react";
import { useState } from "react";
import { Avatar, Badge, SectionHeader, SlidePanel } from "../Components";
import { INSTRUCTORS } from "../Data";

const badgeV: Record<string, string> = { Platinum: "purple", Gold: "gold", None: "gray" };

export default function InstructorsPage() {
  const [panel, setPanel] = useState<(typeof INSTRUCTORS)[0] | null>(null);
  const [comm, setComm] = useState(30);

  return (
    <div className='animate-[pageEnter_0.3s_ease-out]'>
      <SectionHeader
        title='Instructor Management'
        sub={`${INSTRUCTORS.length} instructors · ${INSTRUCTORS.filter(i => i.status === "Pending").length} pending`}
      />

      <div className='bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-b border-slate-800'>
                {[
                  "Instructor",
                  "Courses",
                  "Students",
                  "Revenue",
                  "Rating",
                  "Commission",
                  "Badge",
                  "KYC",
                  "Status",
                  "Actions",
                ].map(head => (
                  <th
                    key={head}
                    className='bg-slate-950/50 text-slate-500 text-[11px] font-semibold uppercase tracking-widest p-3.5 text-left font-mono'
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INSTRUCTORS.map(inst => (
                <tr
                  key={inst.id}
                  className='border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors last:border-0'
                >
                  <td className='p-4 text-[13.5px] text-slate-100'>
                    <div className='flex items-center gap-3'>
                      <Avatar
                        name={inst.name}
                        size={34}
                        gradient='135deg, #da7c36, #d15100'
                      />
                      <div>
                        <div className='font-semibold'>{inst.name}</div>
                        <div className='text-xs text-slate-500'>{inst.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className='p-4'>
                    <Badge variant='blue'>{inst.courses}</Badge>
                  </td>
                  <td className='p-4 font-mono text-[13.5px] text-slate-400'>
                    {inst.students.toLocaleString()}
                  </td>
                  <td className='p-4 font-mono font-semibold text-[13.5px] text-emerald-400'>
                    ${inst.revenue.toLocaleString()}
                  </td>
                  <td className='p-4'>
                    <Badge variant='gold'>⭐ {inst.rating}</Badge>
                  </td>
                  <td className='p-4'>
                    <Badge variant='orange'>{inst.commission}%</Badge>
                  </td>
                  <td className='p-4'>
                    <Badge variant={badgeV[inst.badge]}>{inst.badge}</Badge>
                  </td>
                  <td className='p-4'>
                    <Badge variant={inst.kyc === "Verified" ? "green" : "gray"}>{inst.kyc}</Badge>
                  </td>
                  <td className='p-4'>
                    <Badge variant={inst.status === "Approved" ? "green" : "orange"}>
                      {inst.status}
                    </Badge>
                  </td>
                  <td className='p-4'>
                    <div className='flex gap-2'>
                      <button
                        className='inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all cursor-pointer'
                        onClick={() => {
                          setPanel(inst);
                          setComm(inst.commission);
                        }}
                      >
                        <Eye size={13} />
                      </button>
                      {inst.status === "Pending" && (
                        <>
                          <button className='inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all cursor-pointer'>
                            ✓
                          </button>
                          <button className='inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition-all cursor-pointer'>
                            ✗
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {panel && (
        <SlidePanel
          onClose={() => setPanel(null)}
          title='Instructor Profile'
        >
          <div className='flex gap-4 mb-6'>
            <Avatar
              name={panel.name}
              size={56}
              gradient='135deg, #da7c36, #d15100'
            />
            <div>
              <div className="font-['Syne'] font-bold text-lg text-slate-100">{panel.name}</div>
              <div className='text-[13px] text-slate-500'>{panel.email}</div>
              <div className='flex gap-2 mt-2 flex-wrap'>
                <Badge variant={panel.status === "Approved" ? "green" : "orange"}>
                  {panel.status}
                </Badge>
                <Badge variant={badgeV[panel.badge]}>{panel.badge}</Badge>
                <Badge variant={panel.kyc === "Verified" ? "blue" : "gray"}>KYC: {panel.kyc}</Badge>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5'>
            {[
              { l: "Courses", v: panel.courses },
              { l: "Students", v: panel.students.toLocaleString() },
              { l: "Revenue", v: `$${panel.revenue.toLocaleString()}` },
              { l: "Rating", v: `⭐ ${panel.rating}` },
            ].map(s => (
              <div
                key={s.l}
                className='bg-slate-900 border border-slate-800 rounded-xl p-3 text-center'
              >
                <div className="font-['Syne'] text-[15px] font-bold text-orange-500">{s.v}</div>
                <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mt-1'>
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          <div className='bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-5'>
            <div className='text-[13px] font-semibold text-orange-400 mb-3'>
              Set Commission Rate
            </div>
            <div className='flex gap-3 items-center'>
              <input
                className='bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-[13.5px] text-slate-100 outline-none w-24 focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10 transition-all'
                type='number'
                value={comm}
                onChange={e => setComm(Number(e.target.value))}
                min={0}
                max={100}
              />
              <span className='text-slate-400 font-mono'>%</span>
              <button className='ml-auto inline-flex items-center px-4 py-2 rounded-lg bg-linear-to-br from-orange-500 to-orange-700 text-white text-[13px] font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-px transition-all cursor-pointer'>
                Update
              </button>
            </div>
          </div>

          <div className='bg-slate-900 border border-slate-800 rounded-xl p-4 mb-5'>
            {[
              ["Total Revenue", `$${panel.revenue.toLocaleString()}`],
              ["Platform Commission", `${panel.commission}%`],
              [
                "Instructor Earnings",
                `$${Math.round(panel.revenue * (1 - panel.commission / 100)).toLocaleString()}`,
              ],
              ["Pending Payout", `$${panel.pending.toLocaleString()}`],
            ].map(([k, v], i, arr) => (
              <div
                key={k}
                className={`flex justify-between py-2 ${i < arr.length - 1 ? "border-b border-slate-800" : ""}`}
              >
                <span className='font-mono text-[11px] uppercase tracking-widest text-slate-500'>
                  {k}
                </span>
                <span className='text-[13px] font-semibold text-slate-100'>{v}</span>
              </div>
            ))}
          </div>

          <div className='grid grid-cols-2 gap-2 mb-2'>
            {panel.status === "Pending" ? (
              <>
                <button className='flex justify-center items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer'>
                  ✓ Approve
                </button>
                <button className='flex justify-center items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-semibold hover:bg-red-500/20 transition-all cursor-pointer'>
                  ✗ Reject
                </button>
              </>
            ) : (
              <>
                <button className='flex justify-center items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-semibold hover:bg-red-500/20 transition-all cursor-pointer'>
                  Suspend
                </button>
                <button className='flex justify-center items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-800 text-slate-400 text-[13px] font-semibold hover:bg-slate-800 hover:text-slate-100 transition-all cursor-pointer'>
                  Assign Badge
                </button>
              </>
            )}
          </div>

          <button className='w-full flex justify-center items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer'>
            <DollarSign
              size={13}
              className='text-emerald-400'
            />
            Manual Payout
          </button>
        </SlidePanel>
      )}
    </div>
  );
}
