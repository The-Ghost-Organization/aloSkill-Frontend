"use client";

import { Eye, Pencil, Search, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { createAuthor, getAuthorCandidates, getAdminAuthorDetails, updateAuthor, type AdminAuthor, type AdminAuthorDetails } from "./action";

const fieldClass = "mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-orange-500";

function AddAuthorModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<"external" | "instructor">("external");
  const [candidates, setCandidates] = useState<{ id: string; displayName: string }[]>([]);
  const [candidateError, setCandidateError] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    const previousBody = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousHtml;
    };
  }, []);

  useEffect(() => {
    if (mode !== "instructor") return;
    let active = true;
    void getAuthorCandidates().then(result => {
      if (!active) return;
      if (result.success && result.data) setCandidates(result.data);
      else setCandidateError("Could not load instructors. Please try again.");
    }).catch(() => { if (active) setCandidateError("Could not load instructors. Please try again."); });
    return () => { active = false; };
  }, [mode]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError("");
    startTransition(async () => {
      try {
        const result = await createAuthor({
          name: mode === "external" ? String(data.get("name") ?? "").trim() : undefined,
          instructorProfileId: mode === "instructor" ? String(data.get("instructorProfileId") ?? "") || undefined : undefined,
          bio: String(data.get("bio") ?? "").trim() || undefined,
          photoUrl: String(data.get("photoUrl") ?? "").trim() || undefined,
          websiteUrl: String(data.get("websiteUrl") ?? "").trim() || undefined,
        });
        if (!result.success) return setError(result.message || "Could not create author.");
        onClose();
        router.refresh();
      } catch {
        setError("Could not create author. Please try again.");
      }
    });
  };

  return createPortal(<div className='fixed inset-0 z-60 flex h-dvh w-screen items-center justify-center overflow-hidden bg-slate-950/75 p-4 backdrop-blur-sm' onMouseDown={onClose}>
    <section role='dialog' aria-modal='true' aria-label='Add author profile' className='flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl' onMouseDown={event => event.stopPropagation()}>
      <header className='flex shrink-0 items-center justify-between border-b border-slate-800 px-5 py-4'><h2 className='font-semibold text-slate-100'>Add author profile</h2><button type='button' onClick={onClose} aria-label='Close' className='rounded p-2 text-slate-400 hover:bg-slate-800'><X size={18} /></button></header>
      <form onSubmit={submit} className='min-h-0 space-y-4 overflow-y-auto overscroll-contain p-5'>
        <div className='grid grid-cols-2 gap-2 rounded border border-slate-800 bg-slate-950 p-1'>
          <button type='button' onClick={() => setMode("external")} className={`rounded px-3 py-2 text-xs font-semibold ${mode === "external" ? "bg-orange-500 text-white" : "text-slate-400"}`}>External author</button>
          <button type='button' onClick={() => setMode("instructor")} className={`rounded px-3 py-2 text-xs font-semibold ${mode === "instructor" ? "bg-orange-500 text-white" : "text-slate-400"}`}>AloSkill instructor</button>
        </div>
        {mode === "external" ? <label className='block text-xs font-semibold text-slate-400'>Name<input name='name' className={fieldClass} required minLength={2} maxLength={120} /></label>
          : <label className='block text-xs font-semibold text-slate-400'>Instructor<select name='instructorProfileId' className={fieldClass} required defaultValue=''><option value='' disabled>Select an approved instructor</option>{candidates.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.displayName}</option>)}</select>{candidateError && <span className='mt-1 block text-red-400'>{candidateError}</span>}</label>}
        <label className='block text-xs font-semibold text-slate-400'>Biography (optional)<textarea name='bio' className={`${fieldClass} min-h-28`} maxLength={3000} /></label>
        <label className='block text-xs font-semibold text-slate-400'>Photo URL (optional)<input name='photoUrl' type='url' className={fieldClass} /></label>
        <label className='block text-xs font-semibold text-slate-400'>Website URL (optional)<input name='websiteUrl' type='url' className={fieldClass} /></label>
        {error && <p role='alert' className='text-sm text-red-400'>{error}</p>}
        <div className='flex justify-end gap-2'><button type='button' onClick={onClose} className='rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300'>Cancel</button><button disabled={pending} className='rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50'>{pending ? "Saving…" : "Save author"}</button></div>
      </form>
    </section>
  </div>, document.body);
}


function AuthorDrawer({ author, startEditing, onClose }: {
  author: AdminAuthor; startEditing: boolean; onClose: () => void;
}) {
  const router = useRouter();
  const [details, setDetails] = useState<AdminAuthorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(startEditing);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const oldBody = document.body.style.overflow;
    const oldHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = oldBody;
      document.documentElement.style.overflow = oldHtml;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void getAdminAuthorDetails(author.id).then(result => {
      if (!active) return;
      if (result.success && result.data) setDetails(result.data);
      else setError(result.message || "Could not load author details.");
    }).catch(() => { if (active) setError("Could not load author details."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [author.id]);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!details) return;
    const form = new FormData(event.currentTarget);
    setError("");
    startTransition(async () => {
      try {
        const result = await updateAuthor(author.id, {
          ...(details.instructorProfileId ? {} : { name: String(form.get("name") ?? "").trim() }),
          bio: String(form.get("bio") ?? "").trim() || null,
          photoUrl: String(form.get("photoUrl") ?? "").trim() || null,
          websiteUrl: String(form.get("websiteUrl") ?? "").trim() || null,
        });
        if (!result.success) return setError(result.message || "Could not save author.");
        const refreshed = await getAdminAuthorDetails(author.id);
        if (refreshed.success && refreshed.data) setDetails(refreshed.data);
        setEditing(false);
        router.refresh();
      } catch {
        setError("Could not save author. Please try again.");
      }
    });
  };

  const toggleStatus = () => {
    if (!details || pending) return;
    const next = !details.isActive;
    if (!window.confirm(`${next ? "Activate" : "Deactivate"} ${details.name}?`)) return;
    setError("");
    startTransition(async () => {
      try {
        const result = await updateAuthor(author.id, { isActive: next });
        if (!result.success) return setError(result.message || "Could not update status.");
        setDetails({ ...details, isActive: next });
        router.refresh();
      } catch {
        setError("Could not update status. Please try again.");
      }
    });
  };

  return createPortal(<div className='fixed inset-0 z-50 flex h-dvh w-screen overflow-hidden bg-slate-950/70 backdrop-blur-sm' onMouseDown={onClose}>
    <aside role='dialog' aria-modal='true' aria-label={`Author details for ${author.name}`} className='ml-auto flex h-dvh min-h-0 w-full max-w-2xl flex-col overflow-hidden border-l border-slate-700 bg-slate-950 shadow-2xl' onMouseDown={event => event.stopPropagation()}>
      <header className='flex shrink-0 items-start justify-between gap-3 border-b border-slate-800 p-5'><div className='min-w-0'><p className='text-xs font-semibold uppercase tracking-wider text-orange-400'>Author details</p><h2 className='mt-1 truncate text-xl font-bold text-white'>{details?.name ?? author.name}</h2><p className='text-sm text-slate-500'>{details?.instructorProfileId ? "AloSkill instructor" : "External author"}</p></div><button type='button' onClick={onClose} aria-label='Close author details' className='rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-white'><X size={18} /></button></header>
      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-5'>
        {loading && <p role='status' className='text-sm text-slate-400'>Loading author statistics…</p>}
        {error && <p role='alert' className='rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300'>{error}</p>}
        {details && <>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {([ ["Books", details.stats.bookCount], ["Published", details.stats.publishedBooks], ["Units sold", details.stats.unitsSold], ["Paid sales", `৳ ${details.stats.sales.toLocaleString("en-BD")}`], ["Views", details.stats.views], ["Reviews", details.stats.reviewCount], ["Average rating", details.stats.rating === null ? "—" : `${details.stats.rating.toFixed(1)} / 5`] ] as const).map(([label, value]) =>
              <div key={label} className='rounded-lg border border-slate-800 bg-slate-900 p-3'><p className='text-lg font-bold text-slate-100'>{value}</p><p className='mt-1 text-[10px] uppercase tracking-wide text-slate-500'>{label}</p></div>)}
          </div>
          <section className='rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300'><p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>Profile</p><p className='whitespace-pre-wrap wrap-break-word'>{details.bio || "No biography provided."}</p><p className='mt-3 text-xs text-slate-500'>Status: {details.isActive ? "Active" : "Inactive"} · Added {new Date(details.createdAt).toLocaleDateString("en-BD")}</p></section>
          <section><div className='mb-3 flex items-center justify-between'><h3 className='text-sm font-semibold text-white'>Books ({details.books.length})</h3></div>
            {!details.books.length ? <p className='rounded border border-slate-800 p-4 text-sm text-slate-500'>No books linked to this author yet.</p> : <div className='space-y-2'>{details.books.map(book => <div key={book.id} className='flex min-w-0 items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3'>
              <div className='min-w-0 flex-1'><p className='truncate text-sm font-semibold text-slate-100' title={book.title}>{book.title}</p><p className='mt-1 text-xs text-slate-500'>{book.status} · {book.unitsSold} sold · {book.reviewCount} reviews{book.rating !== null ? ` · ★ ${book.rating.toFixed(1)}` : ""}</p></div>
              {book.status === "APPROVED" && <Link href={`/books/${book.id}`} className='shrink-0 text-xs font-semibold text-orange-400 hover:text-orange-300'>Book page</Link>}
              <Link href={`/dashboard/admin/books/upload-books?editBookid=${book.id}`} className='shrink-0 text-xs font-semibold text-slate-300 hover:text-white'>Edit</Link>
            </div>)}</div>}
          </section>
          <section className='space-y-3 border-t border-slate-800 pt-4'><h3 className='text-sm font-semibold text-white'>Author actions</h3><div className='flex flex-wrap gap-2'><button type='button' onClick={() => setEditing(!editing)} className='inline-flex items-center gap-2 rounded border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800'><Pencil size={14} /> {editing ? "Cancel editing" : "Edit profile"}</button><button type='button' onClick={toggleStatus} disabled={pending} className={`rounded border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${details.isActive ? "border-red-500/40 text-red-400" : "border-emerald-500/40 text-emerald-400"}`}>{details.isActive ? "Deactivate author" : "Activate author"}</button></div>
            {editing && <form onSubmit={save} className='space-y-3 rounded border border-slate-800 bg-slate-900 p-4'>
              {!details.instructorProfileId && <label className='block text-xs text-slate-400'>Name<input name='name' defaultValue={details.name} required minLength={2} maxLength={120} className={fieldClass} /></label>}
              <label className='block text-xs text-slate-400'>Biography<textarea name='bio' defaultValue={details.bio ?? ""} maxLength={3000} className={`${fieldClass} min-h-24`} /></label>
              <label className='block text-xs text-slate-400'>Photo URL<input name='photoUrl' type='url' defaultValue={details.photoUrl ?? ""} className={fieldClass} /></label>
              <label className='block text-xs text-slate-400'>Website URL<input name='websiteUrl' type='url' defaultValue={details.websiteUrl ?? ""} className={fieldClass} /></label>
              <button disabled={pending} className='rounded bg-orange-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50'>{pending ? "Saving…" : "Save changes"}</button>
            </form>}
          </section>
        </>}
      </div>
    </aside>
  </div>, document.body);
}

export default function AuthorsView({ authors }: { authors: AdminAuthor[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AdminAuthor | null>(null);
  const [startEditing, setStartEditing] = useState(false);
  const [page, setPage] = useState(1);
  const filtered = authors.filter(author => author.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const openDetails = (author: AdminAuthor, edit: boolean) => { setStartEditing(edit); setSelected(author); };
  return <>
    <div className='mb-5 flex flex-wrap items-center justify-between gap-3'><p className='text-sm text-slate-400'>{authors.length} authors · {authors.filter(author => author.isActive).length} active</p><button type='button' onClick={() => setOpen(true)} className='inline-flex items-center gap-2 rounded bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'><UserPlus size={16} /> Add Author Profile</button></div>
    <label className='mb-4 flex max-w-md items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 text-slate-500'><Search size={16} /><span className='sr-only'>Search authors</span><input type='search' value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder='Search authors by name' className='w-full bg-transparent py-3 text-sm text-white outline-none' /></label>
    <section className='overflow-hidden rounded-lg border border-slate-800 bg-slate-900'>
      <div className='divide-y divide-slate-800 sm:hidden'>
        {!visible.length && <p className='p-8 text-center text-xs text-slate-500'>{authors.length ? "No authors match your search." : "No author profiles yet. Add one to get started."}</p>}
        {visible.map(author => <div key={author.id} className='flex min-w-0 items-center gap-3 p-3'>
          <div className='min-w-0 flex-1'><p className='truncate text-sm font-semibold text-white' title={author.name}>{author.name}</p><p className='text-xs text-slate-500'>{author.instructorProfileId ? "Instructor" : "External"} · {author._count.books} books · {author.isActive ? "Active" : "Inactive"}</p></div>
          <button type='button' onClick={() => openDetails(author, false)} aria-label={`View ${author.name}`} className='shrink-0 rounded border border-slate-700 p-2 text-slate-300'><Eye size={14} /></button>
          <button type='button' onClick={() => openDetails(author, true)} aria-label={`Edit ${author.name}`} className='shrink-0 rounded border border-slate-700 p-2 text-slate-300'><Pencil size={14} /></button>
        </div>)}
      </div>
      <table className='hidden w-full table-fixed text-left text-sm sm:table'><colgroup><col style={{width:"37%"}} /><col style={{width:"18%"}} /><col style={{width:"13%"}} /><col style={{width:"15%"}} /><col style={{width:"17%"}} /></colgroup>
        <thead className='border-b border-slate-800 text-[10px] uppercase tracking-wide text-slate-500'><tr>{["Author", "Type", "Books", "Status", "Actions"].map(label => <th scope='col' key={label} className='px-2 py-3 sm:px-4'>{label}</th>)}</tr></thead>
        <tbody className='divide-y divide-slate-800'>{!visible.length && <tr><td colSpan={5} className='p-10 text-center text-slate-500'>{authors.length ? "No authors match your search." : "No author profiles yet. Add one to get started."}</td></tr>}
          {visible.map(author => <tr key={author.id} className='hover:bg-slate-800/60'><td className='min-w-0 px-2 py-3 sm:px-4'><span className='block truncate font-semibold text-slate-100' title={author.name}>{author.name}</span></td><td className='px-2 py-3 text-slate-400 sm:px-4'>{author.instructorProfileId ? "Instructor" : "External"}</td><td className='px-2 py-3 text-slate-200 sm:px-4'>{author._count.books}</td><td className={`px-2 py-3 sm:px-4 ${author.isActive ? "text-emerald-400" : "text-red-400"}`}>{author.isActive ? "Active" : "Inactive"}</td><td className='px-2 py-3 sm:px-4'><span className='inline-flex gap-1 whitespace-nowrap'><button type='button' onClick={() => openDetails(author, false)} aria-label={`View ${author.name}`} className='rounded border border-slate-700 p-2 text-slate-300 hover:text-white'><Eye size={14} /></button><button type='button' onClick={() => openDetails(author, true)} aria-label={`Edit ${author.name}`} className='rounded border border-slate-700 p-2 text-slate-300 hover:text-white'><Pencil size={14} /></button></span></td></tr>)}
        </tbody>
      </table>
      {filtered.length > 10 && <nav aria-label='Author pagination' className='flex items-center justify-between border-t border-slate-800 px-4 py-3 text-xs text-slate-400'><span>Page {currentPage} of {totalPages}</span><span className='flex gap-2'><button type='button' disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className='rounded border border-slate-700 px-3 py-1.5 disabled:opacity-40'>Previous</button><button type='button' disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} className='rounded border border-slate-700 px-3 py-1.5 disabled:opacity-40'>Next</button></span></nav>}
    </section>
    {open && <AddAuthorModal onClose={() => setOpen(false)} />}
    {selected && <AuthorDrawer key={selected.id} author={selected} startEditing={startEditing} onClose={() => setSelected(null)} />}
  </>;
}
