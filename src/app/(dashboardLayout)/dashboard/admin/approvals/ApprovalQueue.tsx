"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ApprovalType } from "./action";

type RecordItem = {
  id: string;
  title: string;
  by: string;
  createdAt: string;
  type: ApprovalType;
  image?: string | null;
};
type Props = {
  books: Array<{
    id: string;
    title: string;
    author: string;
    createdAt: string;
    coverImage?: string;
  }>;
  courses: Array<{
    id: string;
    title: string;
    createdAt: string;
    thumbnailUrl?: string | null;
    createdBy?: { displayName: string } | null;
  }>;
  instructors: Array<{
    id: string;
    displayName: string;
    createdAt: string;
    user?: { email: string; avatarUrl?: string | null };
  }>;
};
const labels: Record<ApprovalType, string> = {
  book: "Books",
  course: "Courses",
  instructor: "Instructors",
};
export default function ApprovalQueue({ books, courses, instructors }: Props) {
  const [tab, setTab] = useState<ApprovalType | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const items = useMemo<RecordItem[]>(
    () =>
      [
        ...books.map(b => ({
          id: b.id,
          title: b.title,
          by: b.author,
          createdAt: b.createdAt,
          type: "book" as const,
          image: b.coverImage,
        })),
        ...courses.map(c => ({
          id: c.id,
          title: c.title,
          by: c.createdBy?.displayName ?? "Instructor unavailable",
          createdAt: c.createdAt,
          type: "course" as const,
          image: c.thumbnailUrl,
        })),
        ...instructors.map(i => ({
          id: i.id,
          title: i.displayName,
          by: i.user?.email ?? "",
          createdAt: i.createdAt,
          type: "instructor" as const,
          image: i.user?.avatarUrl,
        })),
      ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [books, courses, instructors]
  );
  const shown = items.filter(
    i =>
      (tab === "all" || i.type === tab) &&
      `${i.title} ${i.by}`.toLowerCase().includes(search.toLowerCase())
  );
  const pages = Math.max(1, Math.ceil(shown.length / 10));
  const current = Math.min(page, pages);
  const changeTab = (value: typeof tab) => {
    setTab(value);
    setPage(1);
  };
  return (
    <main className='min-w-0 space-y-6 text-slate-100'>
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Approvals</h1>
          <p className='mt-1 text-sm text-slate-400'>
            Review submissions before publishing. Oldest submissions appear first.
          </p>
        </div>
        <span className='rounded border border-amber-700/40 bg-amber-950/30 px-4 py-2 text-sm text-amber-300'>
          {items.length} pending
        </span>
      </header>
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {(
          [
            ["All", items.length],
            ["Books", books.length],
            ["Courses", courses.length],
            ["Instructors", instructors.length],
          ] as const
        ).map(([label, count]) => (
          <div
            key={label}
            className='rounded border border-slate-800 bg-slate-900 p-4'
          >
            <p className='text-xs uppercase tracking-wide text-slate-400'>{label}</p>
            <p className='mt-1 text-2xl font-bold'>{count}</p>
          </div>
        ))}
      </div>
      <section className='overflow-hidden rounded border border-slate-800 bg-slate-900/60'>
        <div className='flex flex-wrap items-center gap-2 border-b border-slate-800 p-4'>
          {(["all", "instructor", "book", "course"] as const).map(t => (
            <button
              key={t}
              type='button'
              aria-pressed={tab === t}
              onClick={() => changeTab(t)}
              className={`rounded px-3 py-2 text-sm ${tab === t ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            >
              {t === "all" ? "All" : labels[t]}
            </button>
          ))}
          <label className='ml-auto w-full sm:w-64'>
            <span className='sr-only'>Search approvals</span>
            <input
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder='Search name or title'
              className='w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500'
            />
          </label>
        </div>
        <div className='divide-y divide-slate-800'>
          {shown.slice((current - 1) * 10, current * 10).map(item => (
            <article
              key={`${item.type}-${item.id}`}
              className='flex flex-wrap items-center gap-4 p-4 hover:bg-slate-800/40'
            >
              <div className='flex h-14 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-800 text-xl'>
                {item.image ? (
                  <img
                    src={item.image}
                    alt=''
                    className='h-full w-full object-cover'
                  />
                ) : item.type === "book" ? (
                  "📕"
                ) : item.type === "course" ? (
                  "📘"
                ) : (
                  "👤"
                )}
              </div>
              <div className='min-w-0 flex-1'>
                <span className='text-xs font-medium uppercase text-orange-400'>
                  {labels[item.type]}
                </span>
                <h2
                  className='truncate font-semibold'
                  title={item.title}
                >
                  {item.title}
                </h2>
                <p className='truncate text-xs text-slate-400'>
                  {item.by} · {new Date(item.createdAt).toLocaleDateString("en-BD")}
                </p>
              </div>
              <Link
                href={`/dashboard/admin/approvals/review/${item.type}/${item.id}`}
                className='rounded bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600'
              >
                Review details
              </Link>
            </article>
          ))}
          {!shown.length && (
            <p className='p-10 text-center text-sm text-slate-400'>
              No pending submissions match this view.
            </p>
          )}
        </div>
        <footer className='flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 p-4 text-sm'>
          <span className='text-slate-400'>
            {shown.length ? (current - 1) * 10 + 1 : 0}–{Math.min(current * 10, shown.length)} of{" "}
            {shown.length}
          </span>
          <div className='flex items-center gap-3'>
            <button
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
              className='rounded border border-slate-700 px-3 py-2 disabled:opacity-40'
            >
              Previous
            </button>
            <span>
              {current} / {pages}
            </span>
            <button
              disabled={current >= pages}
              onClick={() => setPage(current + 1)}
              className='rounded border border-slate-700 px-3 py-2 disabled:opacity-40'
            >
              Next
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
