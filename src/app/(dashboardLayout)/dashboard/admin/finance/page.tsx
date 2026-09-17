"use client";

import { DollarSign, Flag, RefreshCw, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, CustomTooltip, KpiCard, SectionHeader } from "../Components";
import { monthlyRevenue, PAYOUTS, REFUNDS, TRANSACTIONS } from "../Data";

const typeV: Record<string, string> = { Enrollment: "green", Payout: "blue", Refund: "orange" };

export default function FinancialPage() {
  const [tab, setTab] = useState("overview");

  return (
    <div className='animate-[pageEnter_0.3s_ease-out]'>
      <SectionHeader
        title='Financial Management'
        sub='Revenue, payouts, refunds and transaction tracking'
      />

      {/* KPI Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <KpiCard
          label='Total Revenue'
          value='$462,800'
          icon={
            <DollarSign
              size={19}
              className='text-blue-400'
            />
          }
          accentColor='var(--color-blue-400)'
        />
        <KpiCard
          label='This Month'
          value='$95,000'
          icon={
            <TrendingUp
              size={19}
              className='text-emerald-400'
            />
          }
          accentColor='var(--color-emerald-400)'
        />
        <KpiCard
          label='Platform Earnings'
          value='$138,840'
          icon={
            <Zap
              size={19}
              className='text-orange-500'
            />
          }
          accentColor='var(--color-orange-500)'
        />
        <KpiCard
          label='Pending Payouts'
          value='$3,500'
          icon={
            <RefreshCw
              size={19}
              className='text-red-500'
            />
          }
          accentColor='var(--color-red-500)'
        />
      </div>

      {/* Tab Navigation */}
      <div className='flex gap-0.5 bg-slate-950 border border-slate-800 p-1 rounded-xl mb-5 w-fit overflow-x-auto'>
        {["overview", "payouts", "refunds", "transactions"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap font-['Outfit'] cursor-pointer ${
              tab === t
                ? "bg-slate-900 text-orange-400 border border-orange-500/20 shadow-md"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      {tab === "overview" && (
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
          <div className="font-['Syne'] font-bold text-base text-slate-100 mb-6">
            Revenue vs Payouts vs Platform
          </div>
          <div className='h-70 w-full'>
            <ResponsiveContainer
              width='100%'
              height='100%'
            >
              <BarChart
                data={monthlyRevenue}
                barSize={18}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#1e293b'
                  vertical={false}
                />
                <XAxis
                  dataKey='m'
                  tick={{ fontSize: 11, fill: "#475569", fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#475569", fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar
                  dataKey='rev'
                  fill='var(--color-blue-500)'
                  radius={[4, 4, 0, 0]}
                  name='Total Revenue'
                />
                <Bar
                  dataKey='platform'
                  fill='var(--color-orange-500)'
                  radius={[4, 4, 0, 0]}
                  name='Platform Earnings'
                />
                <Bar
                  dataKey='enr'
                  fill='var(--color-slate-800)'
                  radius={[4, 4, 0, 0]}
                  name='Enrollments'
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {(tab === "payouts" || tab === "refunds" || tab === "transactions") && (
        <div className='bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative'>
          <div className='flex justify-between items-center px-5 py-4 border-b border-slate-800'>
            <div className="font-['Syne'] font-bold text-base text-slate-100 capitalize">
              {tab} {tab !== "transactions" ? "Requests" : "Log"}
            </div>
            {tab === "payouts" && (
              <Badge variant='orange'>
                {PAYOUTS.filter(p => p.status === "Pending").length} Pending
              </Badge>
            )}
            {tab === "refunds" && (
              <Badge variant='red'>{REFUNDS.filter(r => r.flagged).length} Flagged</Badge>
            )}
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-slate-950 border-b border-slate-800'>
                  {tab === "payouts" &&
                    ["ID", "Instructor", "Amount", "Method", "Date", "Status", "Actions"].map(h => (
                      <th
                        key={h}
                        className='text-left px-5 py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500'
                      >
                        {h}
                      </th>
                    ))}
                  {tab === "refunds" &&
                    ["ID", "Student", "Course", "Amount", "Reason", "Date", "Actions"].map(h => (
                      <th
                        key={h}
                        className='text-left px-5 py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500'
                      >
                        {h}
                      </th>
                    ))}
                  {tab === "transactions" &&
                    ["TXN ID", "Type", "Description", "Amount", "Date", "Status"].map(h => (
                      <th
                        key={h}
                        className='text-left px-5 py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500'
                      >
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-800/50'>
                {tab === "payouts" &&
                  PAYOUTS.map(p => (
                    <tr
                      key={p.id}
                      className='hover:bg-slate-800/30 transition-colors'
                    >
                      <td className='px-5 py-4 font-mono text-xs text-slate-500'>{p.id}</td>
                      <td className='px-5 py-4 text-sm font-semibold text-slate-200'>
                        {p.instructor}
                      </td>
                      <td className='px-5 py-4 font-mono text-sm font-bold text-emerald-400'>
                        ${p.amount.toLocaleString()}
                      </td>
                      <td className='px-5 py-4 text-xs text-slate-400'>{p.method}</td>
                      <td className='px-5 py-4 font-mono text-xs text-slate-500'>{p.date}</td>
                      <td className='px-5 py-4'>
                        <Badge variant={p.status === "Pending" ? "orange" : "green"}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className='px-5 py-4'>
                        {p.status === "Pending" && (
                          <div className='flex gap-2'>
                            <button className='px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer'>
                              Approve
                            </button>
                            <button className='px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer'>
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                {tab === "refunds" &&
                  REFUNDS.map(r => (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-800/30 transition-colors ${r.flagged ? "bg-red-500/5" : ""}`}
                    >
                      <td className='px-5 py-4 font-mono text-xs text-slate-500'>
                        {r.flagged && (
                          <Flag
                            size={12}
                            className='inline mr-1 text-red-500'
                          />
                        )}
                        {r.id}
                      </td>
                      <td className='px-5 py-4 text-sm font-semibold text-slate-200'>
                        {r.student}
                      </td>
                      <td className='px-5 py-4 text-xs text-slate-400'>{r.course}</td>
                      <td className='px-5 py-4 font-mono text-sm font-bold text-red-400'>
                        ${r.amount}
                      </td>
                      <td className='px-5 py-4 text-xs text-slate-400'>{r.reason}</td>
                      <td className='px-5 py-4 font-mono text-xs text-slate-500'>{r.date}</td>
                      <td className='px-5 py-4'>
                        <div className='flex gap-2'>
                          <button className='px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 cursor-pointer'>
                            Approve
                          </button>
                          <button className='px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 cursor-pointer'>
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {tab === "transactions" &&
                  TRANSACTIONS.map(t => (
                    <tr
                      key={t.id}
                      className='hover:bg-slate-800/30 transition-colors'
                    >
                      <td className='px-5 py-4 font-mono text-xs text-slate-500'>{t.id}</td>
                      <td className='px-5 py-4'>
                        <Badge variant={typeV[t.type]}>{t.type}</Badge>
                      </td>
                      <td className='px-5 py-4 text-xs text-slate-400'>{t.desc}</td>
                      <td
                        className={`px-5 py-4 font-mono text-sm font-bold ${t.amount > 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toLocaleString()}
                      </td>
                      <td className='px-5 py-4 font-mono text-xs text-slate-500'>{t.date}</td>
                      <td className='px-5 py-4'>
                        <Badge variant={t.status === "Success" ? "green" : "red"}>{t.status}</Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
