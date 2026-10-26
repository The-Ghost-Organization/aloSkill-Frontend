"use client";

import { apiClient } from "@/lib/api/client";
import {
  AlertTriangle, Archive, BarChart3, BookOpen, ChevronLeft, ChevronRight, Eye,
  GraduationCap, Loader2, Pencil, Search, Star, Trash2, TrendingDown, TrendingUp,
  Users, Wallet, X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AdminCourse, AdminCoursesResponse, CourseStatus } from "./course.types";

type Filter = "ALL" | CourseStatus;
type Action = "PUBLISH" | "DRAFT" | "SUSPEND" | "DELETE";

const money = (value: number, currency = "BDT") =>
  `${currency === "BDT" ? "৳" : currency} ${Number(value).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

const badge: Record<CourseStatus, string> = {
  PUBLISHED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  DRAFT: "border-slate-600 bg-slate-800 text-slate-400",
  SUSPENDED: "border-red-500/20 bg-red-500/10 text-red-400",
};

function Stat({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: typeof Users; color: string }) {
  return <div className='rounded-xl border border-slate-800 bg-slate-900 p-4'><div className='flex items-center justify-between gap-3'><div className='min-w-0'><p className={`truncate text-xl font-bold ${color}`}>{value}</p><p className='mt-1 text-[10px] uppercase tracking-wider text-slate-500'>{label}</p></div><span className='rounded-lg bg-slate-950 p-2 text-slate-500'><Icon size={17} /></span></div></div>;
}

const StatusBadge = ({ value }: { value: CourseStatus }) => (
  <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${badge[value]}`}>{value}</span>
);

export default function CourseManagement() {
  const [data, setData] = useState<AdminCoursesResponse | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AdminCourse | null>(null);
  const [action, setAction] = useState<{ course: AdminCourse; type: Action } | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const requestVersion = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);
  useEffect(() => setPage(1), [filter, debouncedSearch]);

  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10", status: filter });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const response = await apiClient.get<AdminCoursesResponse>(`/admin/courses?${params}`);
      if (version !== requestVersion.current) return;
      if (!response.success || !response.data) {
        setData(null);
        setError(response.message ?? "Unable to load courses.");
      } else {
        setData(response.data);
        setPage(response.data.pagination.page);
      }
    } catch (error) {
      if (version === requestVersion.current) {
        setData(null);
        setError(error instanceof Error ? error.message : "Unable to load courses.");
      }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [page, filter, debouncedSearch]);

  useEffect(() => {
    void load();
    return () => { requestVersion.current++; };
  }, [load]);
  useEffect(() => {
    if (!selected && !action) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [selected, action]);

  const visibleTotals = useMemo(() => ({
    enrollments: data?.items.reduce((sum, item) => sum + item.enrollments, 0) ?? 0,
    revenue: data?.items.reduce((sum, item) => sum + item.revenue, 0) ?? 0,
    averageRating: data?.items.length ? data.items.reduce((sum, item) => sum + item.ratingAverage, 0) / data.items.length : 0,
  }), [data]);

  const runAction = async () => {
    if (!action || saving) return;
    if ((action.type === "SUSPEND" || action.type === "DELETE") && note.trim().length < 5) {
      setActionError("Enter a reason of at least 5 characters.");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      const response = await apiClient.patch(`/admin/courses/${action.course.id}/action`, { action: action.type, note: note.trim() });
      if (!response.success) { setActionError(response.message ?? "Course action failed."); return; }
      setAction(null); setNote(""); setSelected(null); await load();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Course action failed.");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "ALL", label: "All", count: data?.counts.all ?? 0 },
    { key: "PUBLISHED", label: "Published", count: data?.counts.published ?? 0 },
    { key: "PENDING", label: "Pending", count: data?.counts.pending ?? 0 },
    { key: "DRAFT", label: "Draft", count: data?.counts.draft ?? 0 },
    { key: "SUSPENDED", label: "Suspended", count: data?.counts.suspended ?? 0 },
  ];

  return (
    <div>
      <div className='mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <Stat label='Total courses' value={data?.counts.all ?? 0} icon={BookOpen} color='text-blue-400' />
        <Stat label='Enrollments on this page' value={visibleTotals.enrollments} icon={Users} color='text-emerald-400' />
        <Stat label='Revenue on this page' value={money(visibleTotals.revenue)} icon={Wallet} color='text-cyan-400' />
        <Stat label='Average rating on this page' value={visibleTotals.averageRating.toFixed(1)} icon={Star} color='text-amber-400' />
      </div>

      <div className='mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3'>
        <div className='flex max-w-full gap-1 overflow-x-auto rounded-lg bg-slate-950 p-1'>
          {tabs.map(tab => <button key={tab.key} type='button' onClick={() => setFilter(tab.key)} className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold ${filter === tab.key ? "bg-orange-500 text-white" : "text-slate-400 hover:bg-slate-800"}`}>{tab.label} ({tab.count})</button>)}
        </div>
        <label className='relative ml-auto min-w-52 flex-1 sm:max-w-xs'>
          <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500' />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder='Search title, instructor or category' className='w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-orange-500' />
        </label>
      </div>

      {error && <div role='alert' className='mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300'><AlertTriangle size={16} /><span>{error}</span><button type='button' disabled={loading} onClick={() => void load()} className='ml-auto rounded border border-red-500/30 px-3 py-1 disabled:opacity-40'>Retry</button></div>}

      <section className='overflow-hidden rounded-xl border border-slate-800 bg-slate-900'>
        {loading ? <div className='flex min-h-72 items-center justify-center gap-2 text-sm text-slate-400'><Loader2 className='animate-spin' /> Loading courses…</div> : !data?.items.length ? <div className='min-h-72 place-content-center text-center text-sm text-slate-500'>No matching courses found.</div> : <CourseTable courses={data.items} onView={setSelected} />}
      </section>

      <div className='mt-4 flex items-center justify-between text-xs text-slate-500'><span>{data?.pagination.total ?? 0} courses</span><div className='flex items-center gap-2'><button disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)} className='rounded border border-slate-800 p-2 disabled:opacity-40'><ChevronLeft size={14} /></button><span>Page {data?.pagination.page ?? page} of {data?.pagination.totalPages ?? 1}</span><button disabled={page >= (data?.pagination.totalPages ?? 1) || loading} onClick={() => setPage(value => value + 1)} className='rounded border border-slate-800 p-2 disabled:opacity-40'><ChevronRight size={14} /></button></div></div>

      {selected && <CourseDrawer course={selected} onClose={() => setSelected(null)} onAction={type => { setAction({ course: selected, type }); setNote(""); setActionError(""); }} />}
      {action && <ActionDialog value={action} note={note} setNote={setNote} saving={saving} error={actionError} onClose={() => { setAction(null); setNote(""); setActionError(""); }} onConfirm={() => void runAction()} />}
    </div>
  );
}

function CourseTable({ courses, onView }: { courses: AdminCourse[]; onView: (course: AdminCourse) => void }) {
  return <><div className='divide-y divide-slate-800 lg:hidden'>{courses.map(course => <CourseMobile key={course.id} course={course} onView={onView} />)}</div><table className='hidden w-full table-fixed text-left lg:table'><thead className='bg-slate-950/70 text-[10px] uppercase tracking-wider text-slate-500'><tr><th className='w-[30%] px-4 py-3'>Course</th><th className='w-[15%] px-3 py-3'>Instructor</th><th className='w-[11%] px-3 py-3'>Status</th><th className='w-[11%] px-3 py-3'>Students</th><th className='w-[13%] px-3 py-3'>Revenue</th><th className='w-[9%] px-3 py-3'>Rating</th><th className='w-[11%] px-3 py-3 text-right'>Actions</th></tr></thead><tbody className='divide-y divide-slate-800'>{courses.map(course => <tr key={course.id} className={course.status === "SUSPENDED" ? "bg-red-950/15" : "hover:bg-slate-800/40"}><td className='px-4 py-3'><p title={course.title} className='truncate text-sm font-semibold text-slate-100'>{course.title}</p><p className='mt-1 truncate text-xs text-slate-500'>{course.category} · {course.modules} modules · {course.lessons} lessons</p></td><td className='px-3 py-3'><p className='truncate text-xs text-slate-300'>{course.instructor?.name ?? "Unassigned"}</p></td><td className='px-3 py-3'><StatusBadge value={course.status} /></td><td className='px-3 py-3 text-xs text-slate-300'>{course.enrollments.toLocaleString("en-BD")}</td><td className='px-3 py-3 text-xs font-semibold text-emerald-400'>{money(course.revenue, course.currency)}</td><td className='px-3 py-3 text-xs text-amber-400'>★ {course.ratingAverage.toFixed(1)}</td><td className='px-3 py-3'><div className='flex justify-end gap-1'><button title='View statistics' onClick={() => onView(course)} className='rounded-md border border-slate-700 p-2 text-slate-400 hover:text-white'><Eye size={14} /></button><Link title='Edit course' href={`/dashboard/admin/courses/create-course/${course.id}`} className='rounded-md border border-slate-700 p-2 text-slate-400 hover:text-white'><Pencil size={14} /></Link></div></td></tr>)}</tbody></table></>;
}

function CourseMobile({ course, onView }: { course: AdminCourse; onView: (course: AdminCourse) => void }) {
  return <article className={course.status === "SUSPENDED" ? "bg-red-950/15 p-4" : "p-4"}><div className='flex items-start justify-between gap-3'><div className='min-w-0'><p className='truncate font-semibold text-slate-100'>{course.title}</p><p className='mt-1 truncate text-xs text-slate-500'>{course.instructor?.name ?? "Unassigned"} · {course.category}</p></div><StatusBadge value={course.status} /></div><div className='mt-3 grid grid-cols-3 gap-3 text-xs'><div><p className='text-slate-500'>Students</p><p className='text-slate-200'>{course.enrollments}</p></div><div><p className='text-slate-500'>Revenue</p><p className='text-emerald-400'>{money(course.revenue)}</p></div><div><p className='text-slate-500'>Rating</p><p className='text-amber-400'>★ {course.ratingAverage.toFixed(1)}</p></div></div><div className='mt-3 flex gap-2'><button onClick={() => onView(course)} className='inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-700 py-2 text-xs text-slate-300'><Eye size={13} /> Statistics</button><Link href={`/dashboard/admin/courses/create-course/${course.id}`} className='inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-700 py-2 text-xs text-slate-300'><Pencil size={13} /> Edit</Link></div></article>;
}

function CourseDrawer({ course, onClose, onAction }: { course: AdminCourse; onClose: () => void; onAction: (action: Action) => void }) {
  const trendUp = course.enrollmentTrend >= 0;
  return (
    <div className='fixed inset-0 z-50 bg-black/60' onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <aside className='absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-slate-800 bg-[#071426] shadow-2xl'>
        <header className='flex items-start justify-between gap-4 border-b border-slate-800 p-5'>
          <div className='min-w-0'><StatusBadge value={course.status} /><h2 className='mt-3 truncate text-xl font-bold text-white'>{course.title}</h2><p className='mt-1 text-xs text-slate-500'>{course.instructor?.name ?? "Unassigned instructor"} · {course.category}</p></div>
          <button onClick={onClose} className='rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-white'><X size={17} /></button>
        </header>
        <div className='min-h-0 flex-1 overflow-y-auto p-5'>
          {course.suspendReason && <div className='mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300'><p className='font-semibold'>Suspension reason</p><p className='mt-1'>{course.suspendReason}</p></div>}
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            <Stat label='Students' value={course.enrollments} icon={Users} color='text-blue-400' />
            <Stat label='Revenue' value={money(course.revenue, course.currency)} icon={Wallet} color='text-emerald-400' />
            <Stat label='Rating' value={`${course.ratingAverage.toFixed(1)} (${course.ratingCount})`} icon={Star} color='text-amber-400' />
            <Stat label='Completion' value={`${course.completionRate}%`} icon={GraduationCap} color='text-purple-400' />
            <Stat label='Average progress' value={`${course.averageProgress}%`} icon={BarChart3} color='text-cyan-400' />
            <Stat label='Views' value={course.views} icon={Eye} color='text-slate-200' />
          </div>
          <div className='mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4'><div className='flex items-center justify-between'><div><p className='text-xs uppercase tracking-wider text-slate-500'>Enrollment momentum</p><p className='mt-1 text-xl font-bold text-white'>{course.enrolledThisWeek} this week</p></div><div className={`flex items-center gap-1 text-sm font-semibold ${trendUp ? "text-emerald-400" : "text-red-400"}`}>{trendUp ? <TrendingUp size={17} /> : <TrendingDown size={17} />}{course.enrollmentTrend > 0 ? "+" : ""}{course.enrollmentTrend}%</div></div></div>
          <dl className='mt-4 grid grid-cols-2 gap-x-5 gap-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm'><div><dt className='text-xs text-slate-500'>Modules / lessons</dt><dd className='mt-1 text-slate-200'>{course.modules} / {course.lessons}</dd></div><div><dt className='text-xs text-slate-500'>Content duration</dt><dd className='mt-1 text-slate-200'>{Math.floor(course.durationMinutes / 60)}h {course.durationMinutes % 60}m</dd></div><div><dt className='text-xs text-slate-500'>Paid units</dt><dd className='mt-1 text-slate-200'>{course.unitsSold}</dd></div><div><dt className='text-xs text-slate-500'>Wishlists</dt><dd className='mt-1 text-slate-200'>{course.wishlists}</dd></div><div><dt className='text-xs text-slate-500'>Price</dt><dd className='mt-1 text-slate-200'>{money(course.discountPrice ?? course.originalPrice, course.currency)}</dd></div><div><dt className='text-xs text-slate-500'>Updated</dt><dd className='mt-1 text-slate-200'>{new Date(course.updatedAt).toLocaleDateString("en-BD")}</dd></div></dl>
        </div>
        <footer className='flex flex-wrap gap-2 border-t border-slate-800 p-4'>
          <Link href={`/dashboard/admin/courses/create-course/${course.id}`} className='inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200'><Pencil size={13} /> Edit</Link>
          {course.status !== "PUBLISHED" && <button onClick={() => onAction("PUBLISH")} className='rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white'>Publish</button>}
          {course.status === "PUBLISHED" && <button onClick={() => onAction("SUSPEND")} className='inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-300'><Archive size={13} /> Suspend</button>}
          <button onClick={() => onAction("DRAFT")} className='rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300'>Move to draft</button>
          <button onClick={() => onAction("DELETE")} className='ml-auto inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300'><Trash2 size={13} /> Delete</button>
        </footer>
      </aside>
    </div>
  );
}

function ActionDialog({ value, note, setNote, saving, error, onClose, onConfirm }: { value: { course: AdminCourse; type: Action }; note: string; setNote: (value: string) => void; saving: boolean; error: string; onClose: () => void; onConfirm: () => void }) {
  const required = value.type === "SUSPEND" || value.type === "DELETE";
  return (
    <div className='fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4'>
      <div className='w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl'>
        <h3 className='text-lg font-bold text-white'>{value.type.toLowerCase().replace(/^./, char => char.toUpperCase())} course</h3>
        <p className='mt-2 text-sm text-slate-400'>{value.course.title}</p>
        {error && <p role='alert' className='mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300'>{error}</p>}
        <label className='mt-5 block text-xs font-semibold text-slate-400'>Admin note {required ? "(required)" : "(optional)"}<textarea value={note} onChange={event => setNote(event.target.value)} maxLength={500} rows={4} className='mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-orange-500' placeholder='Explain this action…' /></label>
        <div className='mt-5 flex justify-end gap-2'><button disabled={saving} onClick={onClose} className='rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300'>Cancel</button><button disabled={saving || (required && note.trim().length < 5)} onClick={onConfirm} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 ${value.type === "DELETE" ? "bg-red-500" : "bg-orange-500"}`}>{saving ? "Saving…" : "Confirm"}</button></div>
      </div>
    </div>
  );
}
