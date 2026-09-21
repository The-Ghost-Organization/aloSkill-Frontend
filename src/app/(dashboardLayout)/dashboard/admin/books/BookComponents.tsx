"use client";

import { Eye, FolderPlus, PackagePlus, PauseCircle, PlayCircle, Trash2, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { FormEvent, ReactNode } from "react";
import { createBookAuthor, createBookCategory, getAuthorCandidates, softDeleteBook, updateBookSelling, updateBookStock } from "./action";
import type { BookState } from "./books.types";

type AdminBook = BookState["bookBreakdown"][number];
const fieldClass = "mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-orange-500";
const primaryClass = "rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50";

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className='fixed inset-0 z-60 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm' onMouseDown={onClose}>
    <section className='max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl' onMouseDown={event => event.stopPropagation()}>
      <header className='sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4'><h2 className='font-semibold text-slate-100'>{title}</h2><button type='button' onClick={onClose} className='rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white' aria-label='Close'><X size={18} /></button></header>
      <div className='p-5'>{children}</div>
    </section>
  </div>;
}

function ActionForm({ mode, book, onClose }: { mode: "stock" | "selling" | "delete"; book: AdminBook; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [stock, setStock] = useState(String(book.stock));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const suspended = book.status === "SUSPENDED";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (note.trim().length < 5) return setError("Add a clear admin note of at least 5 characters.");
    startTransition(async () => {
      const result = mode === "stock" ? await updateBookStock(book.id, Number(stock), note.trim()) : mode === "delete" ? await softDeleteBook(book.id, note.trim()) : await updateBookSelling(book.id, suspended ? "RESUME" : "STOP", note.trim());
      if (!result?.success) return setError(result?.message ?? "The action could not be completed.");
      onClose();
      router.refresh();
    });
  };

  return <form onSubmit={submit} className='space-y-4'>
    <p className='text-sm leading-6 text-slate-400'>{mode === "delete" ? "This is a recoverable soft deletion. Existing orders and audit history remain intact." : mode === "selling" ? `${suspended ? "Resume" : "Stop"} selling “${book.title}”.` : `Current stock: ${book.stock}`}</p>
    {mode === "stock" && <label className='block text-xs font-semibold text-slate-400'>New stock<input className={fieldClass} type='number' min={0} max={1000000} value={stock} onChange={event => setStock(event.target.value)} required /></label>}
    <label className='block text-xs font-semibold text-slate-400'>Admin note<textarea className={`${fieldClass} min-h-28 resize-y`} value={note} onChange={event => setNote(event.target.value)} maxLength={500} placeholder='Explain why this change is being made…' required /></label>
    {error && <p className='rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400'>{error}</p>}
    <div className='flex justify-end gap-2'><button type='button' onClick={onClose} className='rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800'>Cancel</button><button disabled={pending} className={`${primaryClass} ${mode === "delete" ? "!bg-red-600 hover:!bg-red-700" : ""}`}>{pending ? "Saving…" : mode === "delete" ? "Delete book" : "Save change"}</button></div>
  </form>;
}

export function BookActionButtonEditandView({ book }: { book: AdminBook }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [action, setAction] = useState<"stock" | "selling" | "delete" | null>(null);
  const unitsSold = book.orderItem.reduce((sum, item) => sum + item.quantity, 0);

  return <>
    <button className='inline-flex items-center rounded-lg border border-slate-800 p-2 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white' onClick={() => setPanelOpen(true)} aria-label={`View statistics for ${book.title}`}><Eye size={14} /></button>
    <Link href={`/dashboard/admin/books/upload-books?editBookid=${book.id}`} className='rounded-lg border border-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white'>Edit</Link>
    {panelOpen && <div className='fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm' onMouseDown={() => setPanelOpen(false)}>
      <aside className='ml-auto flex h-[100dvh] w-full max-w-xl flex-col border-l border-slate-700 bg-slate-950 shadow-2xl' onMouseDown={event => event.stopPropagation()}>
        <header className='flex shrink-0 items-start justify-between border-b border-slate-800 p-5'><div><p className='text-xs uppercase tracking-widest text-orange-400'>Book statistics</p><h2 className='mt-1 text-lg font-bold text-white'>{book.title}</h2><p className='text-sm text-slate-500'>{book.author}</p></div><button onClick={() => setPanelOpen(false)} className='rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-white'><X size={18} /></button></header>
        <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-5'>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>{[["Units sold", unitsSold], ["Revenue", `৳ ${book.totalEarning}`], ["Views", book.viewCount], ["Stock", book.stock], ["Reviews", book._count.reviews], ["Wishlists", book._count.wishlistedBy]].map(([label, value]) => <div key={label} className='rounded-xl border border-slate-800 bg-slate-900 p-4'><div className='text-lg font-bold text-slate-100'>{value}</div><div className='mt-1 text-[10px] uppercase tracking-wider text-slate-500'>{label}</div></div>)}</div>
          <section className='rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm'><dl className='grid grid-cols-[110px_1fr] gap-3'><dt className='text-slate-500'>Status</dt><dd className='text-slate-200'>{book.status}</dd><dt className='text-slate-500'>Formats</dt><dd className='text-slate-200'>{book.formats.join(", ")}</dd><dt className='text-slate-500'>Category</dt><dd className='text-slate-200'>{book.category?.name ?? "Uncategorized"}</dd><dt className='text-slate-500'>Last updated</dt><dd className='text-slate-200'>{new Date(book.updatedAt).toLocaleString("en-BD")}</dd>{book.adminNote && <><dt className='text-slate-500'>Admin note</dt><dd className='break-words text-slate-200'>{book.adminNote}</dd></>}</dl></section>
          <section><h3 className='mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500'>Administrative actions</h3><div className='grid gap-2 sm:grid-cols-3'><button onClick={() => setAction("stock")} className='inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-2.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/20'><PackagePlus size={15} /> Update stock</button><button onClick={() => setAction("selling")} className='inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20'>{book.status === "SUSPENDED" ? <PlayCircle size={15} /> : <PauseCircle size={15} />}{book.status === "SUSPENDED" ? "Resume selling" : "Stop selling"}</button><button onClick={() => setAction("delete")} className='inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20'><Trash2 size={15} /> Delete</button></div></section>
        </div>
      </aside>
    </div>}
    {action && <Modal title={action === "stock" ? "Update stock" : action === "delete" ? "Delete book" : book.status === "SUSPENDED" ? "Resume selling" : "Stop selling"} onClose={() => setAction(null)}><ActionForm mode={action} book={book} onClose={() => { setAction(null); setPanelOpen(false); }} /></Modal>}
  </>;
}

export function BookHeaderActions() {
  const [modal, setModal] = useState<"author" | "category" | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [authorMode, setAuthorMode] = useState<"external" | "instructor">("external");
  const [instructors, setInstructors] = useState<
    { id: string; displayName: string; bio: string; website: string | null }[]
  >([]);

  useEffect(() => {
    if (modal !== "author") return;
    void (async () => {
      const result = await getAuthorCandidates();
      if (result.success && result.data) {
        setInstructors(result.data);
      }
    })();
  }, [modal]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result =
        modal === "category"
          ? await createBookCategory(String(data.get("name") ?? ""))
          : await createBookAuthor({
              name: authorMode === "external" ? String(data.get("name") ?? "") : undefined,
              instructorProfileId:
                authorMode === "instructor"
                  ? String(data.get("instructorProfileId") ?? "") || undefined
                  : undefined,
              bio: String(data.get("bio") ?? "") || undefined,
              photoUrl: String(data.get("photoUrl") ?? "") || undefined,
              websiteUrl: String(data.get("websiteUrl") ?? "") || undefined,
            });
      if (!result?.success) return setError(result?.message ?? "Could not save this record.");
      setModal(null);
      setError("");
      setAuthorMode("external");
    });
  };

  return <>
    <button onClick={() => setModal("author")} className='inline-flex items-center gap-1.5 rounded border border-slate-700 px-3.5 py-2.5 text-[13px] font-semibold text-slate-200 hover:border-orange-500/50 hover:text-orange-400'><UserPlus size={14} /> Add Author Profile</button>
    <button onClick={() => setModal("category")} className='inline-flex items-center gap-1.5 rounded border border-slate-700 px-3.5 py-2.5 text-[13px] font-semibold text-slate-200 hover:border-orange-500/50 hover:text-orange-400'><FolderPlus size={14} /> Add Category</button>
    {modal && <Modal title={modal === "author" ? "Add author profile" : "Add book category"} onClose={() => setModal(null)}>
      <form onSubmit={submit} className='space-y-4'>
        {modal === "author" ? <>
          <div className='grid grid-cols-2 gap-2 rounded-lg border border-slate-800 bg-slate-950 p-1'>
            <button type='button' onClick={() => setAuthorMode("external")} className={`rounded-md px-3 py-2 text-xs font-semibold ${authorMode === "external" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>External author</button>
            <button type='button' onClick={() => setAuthorMode("instructor")} className={`rounded-md px-3 py-2 text-xs font-semibold ${authorMode === "instructor" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>AloSkill instructor</button>
          </div>
          {authorMode === "external" ? (
            <label className='block text-xs font-semibold text-slate-400'>Name<input name='name' className={fieldClass} required minLength={2} maxLength={120} /></label>
          ) : (
            <label className='block text-xs font-semibold text-slate-400'>Instructor
              <select name='instructorProfileId' className={fieldClass} required defaultValue=''>
                <option value='' disabled>Select an approved instructor</option>
                {instructors.map(instructor => <option key={instructor.id} value={instructor.id}>{instructor.displayName}</option>)}
              </select>
              <span className='mt-1.5 block text-[11px] font-normal text-slate-500'>Linking an instructor creates one author identity and connects their existing uploaded books.</span>
            </label>
          )}
          <label className='block text-xs font-semibold text-slate-400'>Biography <span className='font-normal text-slate-600'>(optional override)</span><textarea name='bio' className={`${fieldClass} min-h-28`} maxLength={3000} /></label>
          <label className='block text-xs font-semibold text-slate-400'>Photo URL <span className='font-normal text-slate-600'>(optional override)</span><input name='photoUrl' type='url' className={fieldClass} /></label>
          <label className='block text-xs font-semibold text-slate-400'>Website URL <span className='font-normal text-slate-600'>(optional override)</span><input name='websiteUrl' type='url' className={fieldClass} /></label>
        </> : (
          <label className='block text-xs font-semibold text-slate-400'>Name<input name='name' className={fieldClass} required minLength={2} maxLength={120} /></label>
        )}
        {error && <p className='text-sm text-red-400'>{error}</p>}
        <div className='flex justify-end gap-2'><button type='button' onClick={() => setModal(null)} className='rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300'>Cancel</button><button disabled={pending} className={primaryClass}>{pending ? "Saving…" : "Save"}</button></div>
      </form>
    </Modal>}
  </>;
}

