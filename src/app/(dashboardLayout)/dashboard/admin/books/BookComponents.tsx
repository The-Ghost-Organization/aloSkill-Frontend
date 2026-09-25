"use client";

import { Eye, FolderPlus, PackagePlus, PauseCircle, PlayCircle, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { createBookCategory, softDeleteBook, updateBookSelling, updateBookStock } from "./action";
import type { BookState } from "./books.types";

type AdminBook = BookState["bookBreakdown"][number];
const fieldClass =
  "mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-orange-500";
const primaryClass =
  "rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50";

// Render overlays outside dashboard layout containers, which may use transforms or overflow.
// Reference counting keeps the page locked when the statistics panel opens a second modal.
let openOverlayCount = 0;
let previousBodyOverflow = "";
let previousHtmlOverflow = "";

function OverlayPortal({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (openOverlayCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      previousHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    openOverlayCount += 1;
    return () => {
      openOverlayCount -= 1;
      if (openOverlayCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
      }
    };
  }, []);

  return createPortal(children, document.body);
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <OverlayPortal>
      <div
        role='presentation'
        className='fixed inset-0 z-60 flex h-dvh w-screen items-center justify-center overflow-hidden bg-slate-950/75 p-4 backdrop-blur-sm'
        onMouseDown={onClose}
      >
        <section
          role='dialog'
          aria-modal='true'
          aria-label={title}
          className='flex max-h-[calc(100dvh-2rem)] w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl'
          onMouseDown={event => event.stopPropagation()}
        >
          <header className='sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4'>
            <h2 className='font-semibold text-slate-100'>{title}</h2>
            <button
              type='button'
              onClick={onClose}
              className='rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white'
              aria-label='Close'
            >
              <X size={18} />
            </button>
          </header>
          <div className='min-h-0 overflow-y-auto overscroll-contain p-5'>{children}</div>
        </section>
      </div>
    </OverlayPortal>
  );
}

function ActionForm({
  mode,
  book,
  onClose,
}: {
  mode: "stock" | "selling" | "delete";
  book: AdminBook;
  onClose: () => void;
}) {
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
      const result =
        mode === "stock"
          ? await updateBookStock(book.id, Number(stock), note.trim())
          : mode === "delete"
            ? await softDeleteBook(book.id, note.trim())
            : await updateBookSelling(book.id, suspended ? "RESUME" : "STOP", note.trim());
      if (!result?.success)
        return setError(result?.message ?? "The action could not be completed.");
      onClose();
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={submit}
      className='space-y-4'
    >
      <p className='text-sm leading-6 text-slate-400'>
        {mode === "delete"
          ? "This is a recoverable soft deletion. Existing orders and audit history remain intact."
          : mode === "selling"
            ? `${suspended ? "Resume" : "Stop"} selling “${book.title}”.`
            : `Current stock: ${book.stock}`}
      </p>
      {mode === "stock" && (
        <label className='block text-xs font-semibold text-slate-400'>
          New stock
          <input
            className={fieldClass}
            type='number'
            min={0}
            max={1000000}
            value={stock}
            onChange={event => setStock(event.target.value)}
            required
          />
        </label>
      )}
      <label className='block text-xs font-semibold text-slate-400'>
        Admin note
        <textarea
          className={`${fieldClass} min-h-28 resize-y`}
          value={note}
          onChange={event => setNote(event.target.value)}
          maxLength={500}
          placeholder='Explain why this change is being made…'
          required
        />
      </label>
      {error && (
        <p className='rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400'>
          {error}
        </p>
      )}
      <div className='flex justify-end gap-2'>
        <button
          type='button'
          onClick={onClose}
          className='rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800'
        >
          Cancel
        </button>
        <button
          disabled={pending}
          className={`${primaryClass} ${mode === "delete" ? "bg-red-600! hover:bg-red-700!" : ""}`}
        >
          {pending ? "Saving…" : mode === "delete" ? "Delete book" : "Save change"}
        </button>
      </div>
    </form>
  );
}

export function BookActionButtonEditandView({ book }: { book: AdminBook }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [action, setAction] = useState<"stock" | "selling" | "delete" | null>(null);
  const unitsSold = book.orderItem.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <span className='inline-flex shrink-0 items-center gap-1 whitespace-nowrap'>
        <button
          className='inline-flex items-center rounded-lg border border-slate-800 p-2 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
          onClick={() => setPanelOpen(true)}
          aria-label={`View statistics for ${book.title}`}
        >
          <Eye size={14} />
        </button>
        <Link
          href={`/dashboard/admin/books/upload-books?editBookid=${book.id}`}
          className='rounded-lg border border-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
        >
          Edit
        </Link>
      </span>
      {panelOpen && (
        <OverlayPortal>
          <div
            className='fixed inset-0 z-50 flex h-dvh w-screen overflow-hidden bg-slate-950/70 backdrop-blur-sm'
            onMouseDown={() => setPanelOpen(false)}
          >
            <aside
              role='dialog'
              aria-modal='true'
              aria-label={`Book statistics for ${book.title}`}
              className='ml-auto flex h-dvh min-h-0 w-full max-w-xl flex-col overflow-hidden border-l border-slate-700 bg-slate-950 shadow-2xl'
              onMouseDown={event => event.stopPropagation()}
            >
              <header className='flex shrink-0 items-start justify-between border-b border-slate-800 p-5'>
                <div>
                  <p className='text-xs uppercase tracking-widest text-orange-400'>
                    Book statistics
                  </p>
                  <h2 className='mt-1 text-lg font-bold text-white'>{book.title}</h2>
                  <p className='text-sm text-slate-500'>{book.author}</p>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className='rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-white'
                >
                  <X size={18} />
                </button>
              </header>
              <div className='min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-5'>
                {book.status === "SUSPENDED" && (
                  <div
                    role='alert'
                    className='rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200'
                  >
                    <p className='text-xs font-bold uppercase tracking-wide text-red-400'>
                      Selling suspended
                    </p>
                    <p className='mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6'>
                      {book.suspendReason?.trim() || "No suspension reason was recorded."}
                    </p>
                  </div>
                )}
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                  {[
                    ["Units sold", unitsSold],
                    ["Revenue", `৳ ${book.totalEarning}`],
                    ["Views", book.viewCount],
                    ["Stock", book.stock],
                    ["Reviews", book._count.reviews],
                    ["Wishlists", book._count.wishlistedBy],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className='rounded-xl border border-slate-800 bg-slate-900 p-4'
                    >
                      <div className='text-lg font-bold text-slate-100'>{value}</div>
                      <div className='mt-1 text-[10px] uppercase tracking-wider text-slate-500'>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
                <section className='rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm'>
                  <dl className='grid grid-cols-[110px_1fr] gap-3'>
                    <dt className='text-slate-500'>Status</dt>
                    <dd className='text-slate-200'>{book.status}</dd>
                    <dt className='text-slate-500'>Formats</dt>
                    <dd className='text-slate-200'>{book.formats.join(", ")}</dd>
                    <dt className='text-slate-500'>Category</dt>
                    <dd className='text-slate-200'>{book.category?.name ?? "Uncategorized"}</dd>
                    <dt className='text-slate-500'>Last updated</dt>
                    <dd className='text-slate-200'>
                      {new Date(book.updatedAt).toLocaleString("en-BD")}
                    </dd>
                    {book.adminNote && (
                      <>
                        <dt className='text-slate-500'>Admin note</dt>
                        <dd className='wrap-break-word text-slate-200'>{book.adminNote}</dd>
                      </>
                    )}
                  </dl>
                </section>
                <section>
                  <h3 className='mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500'>
                    Administrative actions
                  </h3>
                  <div className='grid gap-2 sm:grid-cols-3'>
                    <button
                      onClick={() => setAction("stock")}
                      className='inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-2.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/20'
                    >
                      <PackagePlus size={15} /> Update stock
                    </button>
                    <button
                      onClick={() => setAction("selling")}
                      className='inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20'
                    >
                      {book.status === "SUSPENDED" ? (
                        <PlayCircle size={15} />
                      ) : (
                        <PauseCircle size={15} />
                      )}
                      {book.status === "SUSPENDED" ? "Resume selling" : "Stop selling"}
                    </button>
                    <button
                      onClick={() => setAction("delete")}
                      className='inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20'
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </section>
              </div>
            </aside>
          </div>
        </OverlayPortal>
      )}
      {action && (
        <Modal
          title={
            action === "stock"
              ? "Update stock"
              : action === "delete"
                ? "Delete book"
                : book.status === "SUSPENDED"
                  ? "Resume selling"
                  : "Stop selling"
          }
          onClose={() => setAction(null)}
        >
          <ActionForm
            mode={action}
            book={book}
            onClose={() => {
              setAction(null);
              setPanelOpen(false);
            }}
          />
        </Modal>
      )}
    </>
  );
}

export function BookHeaderActions() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError("");
    startTransition(async () => {
      try {
        const result = await createBookCategory(String(data.get("name") ?? ""));
        if (!result?.success) return setError(result?.message ?? "Could not add category.");
        setOpen(false);
      } catch {
        setError("Could not add category. Please try again.");
      }
    });
  };

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='inline-flex items-center gap-1.5 rounded border border-slate-700 px-3.5 py-2.5 text-[13px] font-semibold text-slate-200 hover:border-orange-500/50 hover:text-orange-400'
      >
        <FolderPlus size={14} /> Add Category
      </button>
      {open && (
        <Modal
          title='Add book category'
          onClose={() => setOpen(false)}
        >
          <form
            onSubmit={submit}
            className='space-y-4'
          >
            <label className='block text-xs font-semibold text-slate-400'>
              Name
              <input
                name='name'
                className={fieldClass}
                required
                minLength={2}
                maxLength={120}
              />
            </label>
            {error && (
              <p
                role='alert'
                className='text-sm text-red-400'
              >
                {error}
              </p>
            )}
            <div className='flex justify-end gap-2'>
              <button
                type='button'
                onClick={() => setOpen(false)}
                className='rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300'
              >
                Cancel
              </button>
              <button
                disabled={pending}
                className={primaryClass}
              >
                {pending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
