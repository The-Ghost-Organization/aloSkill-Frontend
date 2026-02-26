"use client";

import { SectionHeader, Badge } from "../Components";
import styles from "../AdminDashboard.module.css";
import { APPROVALS } from "../Data";

const typeIcon: Record<string, string> = {
  "New Course": "📘",
  "New Instructor": "👤",
  "Book Approval": "📕",
  "Instructor KYC": "🔐",
  "Course Update": "✏️",
};

export default function ApprovalsPage() {
  return (
    <div className={styles['pageEnter']}>
      <SectionHeader title="Approval Workflow" sub={`${APPROVALS.length} items awaiting your review`} />
      <div className="flex flex-col gap-3">
        {APPROVALS.map((item) => (
          <div
            key={item.id}
            className={styles['card']}
            style={{
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              borderColor: item.priority === "High" ? "rgba(255,71,87,0.25)" : undefined,
            }}
          >
            <div
              style={{
                width: 46, height: 46, borderRadius: 12,
                background: "#070f1e", border: "1px solid #1a3158",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}
            >
              {typeIcon[item.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 items-center mb-1 flex-wrap">
                <Badge variant="blue">{item.type}</Badge>
                {item.priority === "High" && <Badge variant="red">🔴 High Priority</Badge>}
              </div>
              <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 14, color: "#e8f0fe", marginBottom: 3 }}>
                {item.title}
              </div>
              <div className={styles['monoText']} style={{ fontSize: 12, color: "#3d5a80" }}>
                {item.by} · {item.date} · {item.id}
              </div>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              <button className={`${styles['btn']} ${styles['btnGhost']}`} style={{ fontSize: 12 }}>Review</button>
              <button className={`${styles['btn']} ${styles['btnSuccess']}`} style={{ fontSize: 12 }}>✓ Approve</button>
              <button className={`${styles['btn']} ${styles['btnDanger']}`} style={{ fontSize: 12 }}>✗ Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
