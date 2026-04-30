// Server Component — no "use client" directive

import type { BookDetail } from './Approvaldata';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-slate-800 overflow-hidden"
      style={{ background: "#0d1f3c" }}
    >
      <div
        className="px-5 py-3.5 border-b border-slate-800"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
          {title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-800/60 last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
      <span
        className="text-[13px] font-semibold"
        style={{ color: accent ? "#da7c36" : "#e8f0fe" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function BookReviewDetail({ book }: { book: BookDetail }) {
  return (
    <div className="space-y-4">
      {/* Hero */}
      <div
        className="rounded-2xl border border-slate-800 p-6"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold"
                style={{ background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)", color: "#4a9eff" }}
              >
                {book.type}
              </span>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold"
                style={{ background: "rgba(122,156,196,0.08)", border: "1px solid rgba(122,156,196,0.15)", color: "#7a9cc4" }}
              >
                {book.category}
              </span>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold"
                style={{ background: "rgba(122,156,196,0.08)", border: "1px solid rgba(122,156,196,0.15)", color: "#7a9cc4" }}
              >
                {book.language}
              </span>
            </div>
            <h2
              className="text-xl font-extrabold text-slate-100 mb-2 leading-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {book.title}
            </h2>
            <p className="text-[13px] text-slate-400 leading-relaxed">{book.description}</p>
          </div>
          <div
            className="rounded-xl p-4 text-center min-w-25 shrink-0"
            style={{ background: "rgba(218,124,54,0.08)", border: "1px solid rgba(218,124,54,0.2)" }}
          >
            <div
              className="text-2xl font-extrabold"
              style={{ fontFamily: "'Syne', sans-serif", color: "#da7c36" }}
            >
              ${book.price}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mt-1">
              Price
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { l: "Pages", v: book.pages },
            { l: "Sample Pages", v: book.samplePages },
            { l: book.type === "Digital" ? "File Size" : "Stock", v: book.type === "Digital" ? (book.fileSize ?? "—") : (book.stock ?? "—") },
          ].map(s => (
            <div
              key={s.l}
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="text-lg font-bold text-slate-100"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {s.v}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Author & submission info */}
      <Section title="Author & Submission">
        <InfoRow label="Author" value={book.author} accent />
        <InfoRow label="Email" value={book.authorEmail} />
        {book.isbn && <InfoRow label="ISBN" value={book.isbn} />}
        {book.fileFormat && <InfoRow label="File Format" value={book.fileFormat} />}
        {book.publisher && <InfoRow label="Publisher" value={book.publisher} />}
        <InfoRow label="Submitted" value={book.submittedAt} />
      </Section>

      {/* Table of contents */}
      <Section title="Table of Contents">
        <ol className="space-y-1.5">
          {book.tableOfContents.map((chapter, i) => (
            <li key={i} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5"
                style={{ background: "rgba(74,158,255,0.1)", color: "#4a9eff" }}
              >
                {i + 1}
              </div>
              <span className="text-[13px] text-slate-300">{chapter}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Physical book details */}
      {book.type === "Physical" && book.stock !== undefined && (
        <Section title="Physical Book Details">
          <InfoRow label="Stock Available" value={book.stock ?? 0} accent />
          {book.publishedYear && <InfoRow label="Published Year" value={book.publishedYear} />}
        </Section>
      )}

      {/* Digital book details */}
      {book.type === "Digital" && (
        <Section title="Digital File Details">
          {book.fileFormat && <InfoRow label="Format" value={book.fileFormat} accent />}
          {book.fileSize && <InfoRow label="File Size" value={book.fileSize} />}
        </Section>
      )}

      {/* Previous admin notes */}
      {book.previousNotes && (
        <div
          className="rounded-2xl p-4 flex gap-3"
          style={{ background: "rgba(255,193,7,0.06)", border: "1px solid rgba(255,193,7,0.2)" }}
        >
          <svg viewBox="0 0 24 24" width={16} height={16} fill="#ffc107" className="shrink-0 mt-0.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-yellow-600 mb-1">
              Previous Admin Note
            </div>
            <div className="text-[12px] text-yellow-200/70 leading-relaxed">{book.previousNotes}</div>
          </div>
        </div>
      )}
    </div>
  );
}
