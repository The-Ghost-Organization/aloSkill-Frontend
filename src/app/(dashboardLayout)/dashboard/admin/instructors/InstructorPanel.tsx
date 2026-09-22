"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { getInstructorDetails, updateInstructor, type AdminInstructor, type InstructorDetails } from "./action";

type InstructorAction = "APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE";
const money = (value: number) => `৳ ${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

export default function InstructorPanel({ instructor, onClose }: { instructor: AdminInstructor; onClose: () => void }) {
  const router = useRouter();
  const [details, setDetails] = useState<InstructorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState<InstructorAction | null>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const priorBody = document.body.style.overflow;
    const priorHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => { document.body.style.overflow = priorBody; document.documentElement.style.overflow = priorHtml; };
  }, []);
  useEffect(() => {
    let active = true;
    void getInstructorDetails(instructor.id).then(result => {
      if (!active) return;
      if (result.success && result.data) setDetails(result.data);
      else setError(result.message || "Could not load instructor details.");
    }).catch(() => { if (active) setError("Could not load instructor details."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [instructor.id]);

  const submitAction = () => {
    if (!action || note.trim().length < 5 || pending) return;
    setError("");
    startTransition(async () => {
      try {
        const result = await updateInstructor(instructor.id, action, note.trim());
        if (!result.success) return setError(result.message || "Action failed.");
        const updated = await getInstructorDetails(instructor.id);
        if (updated.success && updated.data) setDetails(updated.data);
        setAction(null);
        setNote("");
        router.refresh();
      } catch { setError("Action failed. Please try again."); }
    });
  };
  const status = details?.status ?? instructor.status;
  const account = details?.user.status ?? instructor.user.status;
  return createPortal(<div className='fixed inset-0 z-50 flex h-dvh w-screen overflow-hidden bg-slate-950/70 backdrop-blur-sm' onMouseDown={onClose}>
    <aside role='dialog' aria-modal='true' aria-label={`Instructor profile for ${instructor.displayName}`} className='ml-auto flex h-dvh min-h-0 w-full max-w-2xl flex-col overflow-hidden border-l border-slate-700 bg-slate-950 shadow-2xl' onMouseDown={event => event.stopPropagation()}>
      <header className='flex shrink-0 items-start justify-between gap-3 border-b border-slate-800 p-5'><div className='min-w-0'><p className='text-xs font-semibold uppercase tracking-widest text-orange-400'>Instructor profile</p><h2 className='mt-1 truncate text-xl font-bold text-white'>{details?.displayName ?? instructor.displayName}</h2><p className='truncate text-sm text-slate-500'>{details?.user.email ?? instructor.user.email}</p></div><button onClick={onClose} aria-label='Close instructor panel' className='rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-white'><X size={18} /></button></header>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-5'>
        {loading && <p role='status' className='text-sm text-slate-400'>Loading instructor statistics…</p>}
        {error && <p role='alert' className='rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300'>{error}</p>}
        {details && <>
          <div className='flex flex-wrap gap-2 text-xs'><span className='rounded bg-slate-800 px-2 py-1 text-white'>Application: {status}</span><span className='rounded bg-slate-800 px-2 py-1 text-white'>Account: {account}</span></div>
          {details.suspendReason && account === "SUSPENDED" && <p className='rounded border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300'><strong>Suspension reason:</strong> {details.suspendReason}</p>}
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {([ ["Courses", details.stats.courses], ["Active enrollments", details.stats.activeEnrollments], ["Units sold", details.stats.unitsSold], ["Paid course sales", money(details.stats.paidSales)], ["Course views", details.stats.views], ["Reviews", details.stats.reviewCount], ["Average rating", details.stats.rating === null ? "—" : `${details.stats.rating.toFixed(1)} / 5`], ["Pending payout", money(details.stats.pendingPayout)], ["Authored books", details.authorBookCount] ] as const).map(([label, value]) => <div key={label} className='rounded-lg border border-slate-800 bg-slate-900 p-3'><p className='text-lg font-bold text-slate-100'>{value}</p><p className='mt-1 text-[10px] uppercase tracking-wide text-slate-500'>{label}</p></div>)}
          </div>
          <section className='rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300'><p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>Profile</p><p className='whitespace-pre-wrap wrap-break-word'>{details.bio || "No biography provided."}</p>{details.expertise && <p className='mt-3 text-xs text-slate-400'>Expertise: {details.expertise}</p>}{details.adminNote && <p className='mt-3 text-xs text-amber-400'>Last admin note: {details.adminNote}</p>}</section>
          <section><h3 className='mb-3 text-sm font-semibold text-white'>Courses ({details.courses.length})</h3>{!details.courses.length ? <p className='rounded border border-slate-800 p-4 text-sm text-slate-500'>No courses yet.</p> : <div className='space-y-2'>{details.courses.map(course => <div key={course.id} className='rounded-lg border border-slate-800 bg-slate-900 p-3'><p className='truncate text-sm font-semibold text-slate-100' title={course.title}>{course.title}</p><p className='mt-1 text-xs text-slate-500'>{course.status} · {course.activeEnrollments} active enrollments · {money(course.paidSales)} paid sales · {course.reviewCount} reviews</p></div>)}</div>}</section>
          <section className='space-y-3 border-t border-slate-800 pt-4'><h3 className='text-sm font-semibold text-white'>Administrative actions</h3><p className='text-xs text-slate-500'>Every action requires an admin note. Suspending this instructor suspends their entire user account.</p><div className='flex flex-wrap gap-2'>
            {status === "PENDING" && <><button onClick={() => setAction("APPROVE")} className='rounded border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-400'>Approve</button><button onClick={() => setAction("REJECT")} className='rounded border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-400'>Reject</button></>}
            {status === "APPROVED" && account === "ACTIVE" && <button onClick={() => setAction("SUSPEND")} className='rounded border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-400'>Suspend account</button>}
            {status === "APPROVED" && account === "SUSPENDED" && <button onClick={() => setAction("REACTIVATE")} className='rounded border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-400'>Reactivate account</button>}
          </div>
          {action && <div className='space-y-3 rounded border border-slate-700 bg-slate-900 p-4'><p className='text-sm font-semibold text-white'>{action[0]}{action.slice(1).toLowerCase()} instructor</p><label className='block text-xs text-slate-400'>Admin note<textarea value={note} onChange={event => setNote(event.target.value)} minLength={5} maxLength={500} placeholder='Explain this decision (at least 5 characters)' className='mt-1 w-full rounded border border-slate-700 bg-slate-950 p-3 text-sm text-white' /></label><div className='flex justify-end gap-2'><button onClick={() => { setAction(null); setNote(""); }} className='rounded border border-slate-700 px-3 py-2 text-xs text-slate-300'>Cancel</button><button onClick={submitAction} disabled={pending || note.trim().length < 5} className='rounded bg-orange-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50'>{pending ? "Saving…" : "Confirm action"}</button></div></div>}
          </section>
        </>}
      </div>
    </aside>
  </div>, document.body);
}
