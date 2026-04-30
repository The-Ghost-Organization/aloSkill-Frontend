import Link from "next/link";
import { APPROVALS_DETAIL } from './Approvaldata';
import QuickApproveButton from './Quickapprovebutton';
import QuickRejectButton from './Quickrejectbutton';

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "blue" | "red" | "green" | "orange" | "gray";
}) {
  const styles: Record<string, React.CSSProperties> = {
    blue: { background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)", color: "#4a9eff" },
    red: { background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.2)", color: "#ff4757" },
    green: { background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.2)", color: "#00e5a0" },
    orange: { background: "rgba(218,124,54,0.12)", border: "1px solid rgba(218,124,54,0.25)", color: "#fc9759" },
    gray: { background: "rgba(122,156,196,0.08)", border: "1px solid rgba(122,156,196,0.15)", color: "#7a9cc4" },
  };
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold" style={styles[variant]}>
      {children}
    </span>
  );
}

const typeIcon: Record<string, string> = {
  "New Course": "📘",
  "New Instructor": "👤",
  "Book Approval": "📕",
  "Instructor KYC": "🔐",
  "Course Update": "✏️",
};

const typeColor: Record<string, string> = {
  "New Course": "#4a9eff",
  "New Instructor": "#00e5a0",
  "Book Approval": "#b47aff",
  "Instructor KYC": "#ffc107",
  "Course Update": "#da7c36",
};

function ApprovalCard({ item }: { item: (typeof APPROVALS_DETAIL)[0] }) {
  return (
    <div
      className="relative overflow-hidden flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all"
      style={{
        background: "#0d1f3c",
        borderColor: item.priority === "High" ? "rgba(255,71,87,0.2)" : "#1a3158",
        boxShadow: item.priority === "High" ? "0 4px 24px rgba(255,71,87,0.05)" : "none",
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%)" }} />
      {item.priority === "High" && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: "#ff4757", boxShadow: "0 0 8px rgba(255,71,87,0.5)" }} />
      )}
      <div
        className="flex shrink-0 items-center justify-center w-11 h-11 rounded-xl text-xl"
        style={{ background: `${typeColor[item.type]}12`, border: `1px solid ${typeColor[item.type]}25` }}
      >
        {typeIcon[item.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-2 items-center mb-1">
          <Badge variant="blue">{item.type}</Badge>
          {item.priority === "High" && <Badge variant="red">🔴 High Priority</Badge>}
        </div>
        <div className="font-bold text-sm text-slate-100 mb-0.5 truncate">{item.title}</div>
        <div className="text-xs text-slate-500 font-medium">{item.by} · {item.date} · {item.id}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <Link
          href={`/dashboard/admin/approvals/${item.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-[12px] font-semibold transition-all"
          style={{ background: "rgba(218,124,54,0.1)", border: "1px solid rgba(218,124,54,0.25)", color: "#fc9759" }}
        >
          <svg viewBox="0 0 24 24" width={12} height={12} fill="#fc9759">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
          Review
        </Link>
        <QuickApproveButton approvalId={item.id} title={item.title} />
        <QuickRejectButton approvalId={item.id} />
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  const highPriority = APPROVALS_DETAIL.filter(a => a.priority === "High");
  const normal = APPROVALS_DETAIL.filter(a => a.priority === "Normal");

  return (
    <div className="animate-page-enter">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-100" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.3px" }}>
            Approval Workflow
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {APPROVALS_DETAIL.length} items awaiting review ·{" "}
            <span className="text-red-400">{highPriority.length} high priority</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: "rgba(255,71,87,0.06)", border: "1px solid rgba(255,71,87,0.15)" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: "#ff4757", boxShadow: "0 0 6px #ff4757" }} />
          <span className="font-mono text-[11px] text-red-400 uppercase tracking-wider">{highPriority.length} urgent</span>
        </div>
      </div>

      {highPriority.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ background: "rgba(255,71,87,0.2)" }} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-red-500/70">High Priority</span>
            <div className="h-px flex-1" style={{ background: "rgba(255,71,87,0.2)" }} />
          </div>
          <div className="flex flex-col gap-3">
            {highPriority.map(item => <ApprovalCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {normal.length > 0 && (
        <div>
          {highPriority.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1" style={{ background: "#1a3158" }} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">Normal</span>
              <div className="h-px flex-1" style={{ background: "#1a3158" }} />
            </div>
          )}
          <div className="flex flex-col gap-3">
            {normal.map(item => <ApprovalCard key={item.id} item={item} />)}
          </div>
        </div>
      )}
    </div>
  );
}
