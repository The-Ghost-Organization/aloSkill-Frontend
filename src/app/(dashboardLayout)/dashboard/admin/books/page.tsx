"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Badge, SectionHeader } from "../Components";
import { BOOKS } from "../Data";

export default function BooksPage() {
  return (
    <div className='animate-[pageEnter_0.3s_ease-out]'>
      <SectionHeader
        title='Books & Products'
        sub='Manage digital and physical book inventory'
        action={
          <Link href='/dashboard/admin/books/upload-books'>
            <button className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-linear-to-br from-orange-500 to-orange-700 text-white font-['Outfit'] font-semibold text-[13px] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/45 hover:-translate-y-px transition-all cursor-pointer border-none">
              <Plus
                size={14}
                color='white'
              />{" "}
              Add Book
            </button>
          </Link>
        }
      />

      {/* KPI Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6'>
        {[
          { l: "Total Books", v: "312", text: "text-blue-400", border: "after:bg-blue-400" },
          {
            l: "Digital Sales",
            v: "1,160",
            text: "text-emerald-400",
            border: "after:bg-emerald-400",
          },
          { l: "Physical Stock", v: "148", text: "text-orange-500", border: "after:bg-orange-500" },
          {
            l: "Total Revenue",
            v: "$12,140",
            text: "text-purple-400",
            border: "after:bg-purple-400",
          },
        ].map(s => (
          <div
            key={s.l}
            className={`group relative bg-slate-900 border border-slate-800 rounded-2xl p-5.5 transition-all duration-250 hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/40 overflow-hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:opacity-40 hover:after:opacity-100 after:transition-opacity ${s.border}`}
          >
            <div className={`font-['Syne'] text-[22px] font-bold mb-1 ${s.text}`}>{s.v}</div>
            <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500'>
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className='bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-b border-slate-800'>
                {[
                  "Title",
                  "Author",
                  "Type",
                  "Price",
                  "Sales",
                  "Revenue",
                  "Stock",
                  "Status",
                  "Actions",
                ].map(h => (
                  <th
                    key={h}
                    className='bg-slate-950/50 text-slate-500 text-[11px] font-semibold uppercase tracking-widest p-3.5 px-4.5 text-left font-mono border-b border-slate-800'
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-800/50'>
              {BOOKS.map(b => (
                <tr
                  key={b.id}
                  className='transition-colors hover:bg-slate-800/60'
                >
                  <td className='p-4 px-4.5 text-[13.5px] text-slate-100 font-semibold'>
                    {b.title}
                  </td>
                  <td className='p-4 px-4.5 text-[13.5px] text-slate-400'>{b.author}</td>
                  <td className='p-4 px-4.5'>
                    <Badge variant={b.type === "Digital" ? "blue" : "orange"}>{b.type}</Badge>
                  </td>
                  <td className='p-4 px-4.5 text-[13.5px] text-slate-100 font-mono font-semibold'>
                    ${b.price}
                  </td>
                  <td className='p-4 px-4.5'>
                    <Badge variant='gray'>{b.sales}</Badge>
                  </td>
                  <td className='p-4 px-4.5 text-[13.5px] text-emerald-400 font-mono font-semibold'>
                    ${b.rev.toLocaleString()}
                  </td>
                  <td
                    className={`p-4 px-4.5 text-[13.5px] font-mono ${
                      b.stock === null
                        ? "text-slate-600"
                        : b.stock < 20
                          ? "text-red-500"
                          : "text-slate-400"
                    }`}
                  >
                    {b.stock === null ? "∞" : b.stock}
                  </td>
                  <td className='p-4 px-4.5'>
                    <Badge variant={b.status === "Approved" ? "green" : "orange"}>{b.status}</Badge>
                  </td>
                  <td className='p-4 px-4.5'>
                    <div className='flex gap-2'>
                      <button className="px-2.5 py-1.5 rounded-lg bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-slate-100 hover:border-slate-700 transition-all cursor-pointer text-xs font-semibold font-['Outfit']">
                        Edit
                      </button>
                      {b.status === "Pending" && (
                        <button className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer text-xs font-semibold font-['Outfit']">
                          Approve
                        </button>
                      )}
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
