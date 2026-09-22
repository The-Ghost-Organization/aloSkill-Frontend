"use client";

import { Eye, Search } from "lucide-react";
import { useState } from "react";
import InstructorPanel from "./InstructorPanel";
import type { AdminInstructor } from "./action";

type Filter = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
const PAGE_SIZE = 10;

export default function InstructorsView({ instructors }: { instructors: AdminInstructor[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [requestedPage, setRequestedPage] = useState(1);
  const [selected, setSelected] = useState<AdminInstructor | null>(null);
  const matches = instructors.filter(item => {
    const textMatches = `${item.displayName} ${item.user.email}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    return textMatches && (filter === "ALL" || (filter === "SUSPENDED" ? item.user.status === "SUSPENDED" : item.status === filter));
  });
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pages);
  const visible = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changeFilter = (next: Filter) => { setFilter(next); setRequestedPage(1); };
  const empty = instructors.length ? "No instructors match these filters." : "No instructor profiles found.";
  const status = (item: AdminInstructor) => item.user.status === "SUSPENDED" ? "Suspended" : item.status[0] + item.status.slice(1).toLowerCase();

  return <>
    <div className='mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4'>
      {([ ["Total instructors", instructors.length], ["Approved", instructors.filter(i => i.status === "APPROVED").length], ["Pending", instructors.filter(i => i.status === "PENDING").length], ["Suspended accounts", instructors.filter(i => i.user.status === "SUSPENDED").length] ] as const).map(([label, value]) => <div key={label} className='rounded border border-slate-800 bg-slate-900 p-4'><p className='font-mono text-xl font-bold text-orange-400'>{value}</p><p className='mt-1 text-xs text-slate-500'>{label}</p></div>)}
    </div>
    <div className='mb-4 flex flex-wrap items-center gap-3'>
      <label className='flex w-full max-w-sm items-center gap-2 rounded border border-slate-700 bg-slate-900 px-3 text-slate-500'><Search size={16} /><span className='sr-only'>Search instructors</span><input type='search' value={query} onChange={event => { setQuery(event.target.value); setRequestedPage(1); }} placeholder='Search name or email' className='w-full bg-transparent py-2.5 text-sm text-white outline-none' /></label>
      <div className='flex flex-wrap gap-2'>{([ ["ALL", "All"], ["APPROVED", "Approved"], ["PENDING", "Pending"], ["REJECTED", "Rejected"], ["SUSPENDED", "Suspended"] ] as const).map(([value, label]) => <button key={value} onClick={() => changeFilter(value)} aria-pressed={filter === value} className={`rounded px-3 py-2 text-xs font-semibold ${filter === value ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>{label}</button>)}</div>
    </div>
    <section className='overflow-hidden rounded border border-slate-800 bg-slate-900'>
      <div className='divide-y divide-slate-800 md:hidden'>{!visible.length && <p className='p-10 text-center text-sm text-slate-500'>{empty}</p>}{visible.map(item => <div key={item.id} className='flex min-w-0 items-center gap-3 p-4'><div className='min-w-0 flex-1'><p className='truncate text-sm font-semibold text-white'>{item.displayName}</p><p className='truncate text-xs text-slate-500'>{item.user.email}</p><p className='mt-1 text-xs text-slate-400'>{item.courseCount} courses · {item.activeEnrollments} enrollments · {status(item)}</p></div><button onClick={() => setSelected(item)} aria-label={`View ${item.displayName}`} className='shrink-0 rounded border border-slate-700 p-2 text-slate-300'><Eye size={15} /></button></div>)}</div>
      <table className='hidden w-full table-fixed text-left text-sm md:table'><colgroup><col style={{width:"33%"}}/><col style={{width:"12%"}}/><col style={{width:"15%"}}/><col style={{width:"14%"}}/><col style={{width:"18%"}}/><col style={{width:"8%"}}/></colgroup><thead className='border-b border-slate-800 text-[10px] uppercase tracking-wide text-slate-500'><tr>{["Instructor", "Courses", "Enrollments", "Rating", "Status", "View"].map(name => <th scope='col' key={name} className='px-3 py-3'>{name}</th>)}</tr></thead><tbody className='divide-y divide-slate-800'>{!visible.length && <tr><td colSpan={6} className='p-10 text-center text-slate-500'>{empty}</td></tr>}{visible.map(item => <tr key={item.id} className='hover:bg-slate-800/60'><td className='min-w-0 px-3 py-3'><p className='truncate font-semibold text-white' title={item.displayName}>{item.displayName}</p><p className='truncate text-xs text-slate-500' title={item.user.email}>{item.user.email}</p></td><td className='px-3 py-3 text-slate-300'>{item.courseCount}</td><td className='px-3 py-3 text-slate-300'>{item.activeEnrollments}</td><td className='px-3 py-3 text-amber-400'>{item.rating === null ? "—" : `★ ${item.rating.toFixed(1)}`}</td><td className={`px-3 py-3 ${item.user.status === "SUSPENDED" || item.status === "REJECTED" ? "text-red-400" : item.status === "APPROVED" ? "text-emerald-400" : "text-amber-400"}`}>{status(item)}</td><td className='px-3 py-3'><button onClick={() => setSelected(item)} aria-label={`View ${item.displayName}`} className='rounded border border-slate-700 p-2 text-slate-300 hover:bg-slate-800'><Eye size={15}/></button></td></tr>)}</tbody></table>
      {matches.length > PAGE_SIZE && <nav aria-label='Instructor pagination' className='flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-4 py-3 text-xs text-slate-400'><span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, matches.length)} of {matches.length}</span><div className='flex items-center gap-2'><button disabled={page === 1} onClick={() => setRequestedPage(page - 1)} className='rounded border border-slate-700 px-3 py-2 disabled:opacity-40'>Previous</button><span>Page {page} of {pages}</span><button disabled={page === pages} onClick={() => setRequestedPage(page + 1)} className='rounded border border-slate-700 px-3 py-2 disabled:opacity-40'>Next</button></div></nav>}
    </section>
    {selected && <InstructorPanel key={selected.id} instructor={selected} onClose={() => setSelected(null)} />}
  </>;
}
