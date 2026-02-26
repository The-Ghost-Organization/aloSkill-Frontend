"use client";

import { Toggle, SectionHeader, Badge } from "../Components";
import styles from "../AdminDashboard.module.css";

const logs = [
  { admin: "Super Admin", action: "Approved instructor: James Carter", time: "Feb 19 · 10:24 AM", ip: "103.211.x.x" },
  { admin: "Finance Admin", action: "Processed payout: $3,200 → Ravi Patel", time: "Feb 19 · 9:42 AM", ip: "202.134.x.x" },
  { admin: "Moderator", action: "Deleted spam review on Full-Stack Bootcamp", time: "Feb 18 · 4:17 PM", ip: "119.18.x.x" },
  { admin: "Super Admin", action: "IP blocked: 45.93.201.xxx", time: "Feb 18 · 2:05 PM", ip: "103.211.x.x" },
  { admin: "Finance Admin", action: "Rejected refund REF-003 (fraud flagged)", time: "Feb 18 · 11:30 AM", ip: "202.134.x.x" },
];

export default function SecurityPage() {
  return (
    <div className={styles['pageEnter']}>
      <SectionHeader title="Security & Control" sub="Roles, permissions, audit logs and fraud detection" />
      <div className={`${styles['chartRow2col']}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className={styles['card']} style={{ padding: 24 }}>
          <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 20 }}>Admin Roles</div>
          {[
            { role: "Super Admin", perms: "Full Access", color: "#ff4757", admins: 1 },
            { role: "Finance Admin", perms: "Financial Only", color: "#da7c36", admins: 2 },
            { role: "Moderator", perms: "Content & Reviews", color: "#00e5a0", admins: 3 },
          ].map((r) => (
            <div key={r.role} style={{ background: "#070f1e", border: "1px solid #1a3158", borderRadius: 10, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: r.color }}>{r.role}</div>
                <div className={styles['monoText']} style={{ fontSize: 11, color: "#3d5a80", marginTop: 2 }}>{r.perms}</div>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="gray">{r.admins} admin{r.admins > 1 ? "s" : ""}</Badge>
                <button className={`${styles['btn']} ${styles['btnGhost']}`} style={{ padding: "4px 10px", fontSize: 11 }}>Manage</button>
              </div>
            </div>
          ))}
          <button className={`${styles['btn']} ${styles['btnPrimary']}`} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>+ Add Admin</button>
        </div>

        <div className={styles['card']} style={{ padding: 24 }}>
          <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 20 }}>Security Controls</div>
          {[
            ["Two-Factor Authentication", "Required for all admins", true],
            ["IP Blocking", "Block suspicious IP addresses", true],
            ["AI Fraud Detection", "Monitor unusual transactions", true],
            ["Login Attempt Limit", "Lock after 5 failed attempts", true],
            ["Activity Logging", "Full audit trail", true],
          ].map(([l, s, on]) => (
            <div key={String(l)} className="flex justify-between items-center" style={{ padding: "12px 0", borderBottom: "1px solid #1a3158" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#e8f0fe" }}>{l}</div>
                <div style={{ fontSize: 11, color: "#3d5a80", marginTop: 2 }}>{s}</div>
              </div>
              <Toggle on={Boolean(on)} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles['card']} style={{ padding: 24 }}>
        <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 20 }}>Activity Audit Log</div>
        {logs.map((l, i) => (
          <div key={i} className="flex gap-4" style={{ padding: "13px 0", borderBottom: i < logs.length - 1 ? "1px solid #1a3158" : "none" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#da7c36", flexShrink: 0, marginTop: 7, boxShadow: "0 0 6px rgba(218,124,54,0.5)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#e8f0fe" }}>
                <span style={{ fontWeight: 700, color: "#fc9759" }}>{l.admin}</span> — {l.action}
              </div>
              <div className={styles['monoText']} style={{ fontSize: 11, color: "#3d5a80", marginTop: 3 }}>
                {l.time} · IP: {l.ip}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
