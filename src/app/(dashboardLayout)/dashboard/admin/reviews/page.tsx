"use client";

import { Check, Trash2, Flag } from "lucide-react";
import { Avatar, Badge, SectionHeader } from "../Components";
import styles from "../AdminDashboard.module.css";
import { REVIEWS } from "../Data";

export default function ReviewsPage() {
  return (
    <div className={styles['pageEnter']}>
      <SectionHeader title="Reviews & Ratings" sub="Moderate and manage all platform reviews" />
      <div className={`${styles['kpiGrid4']}`} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { l: "Total Reviews", v: "8,420", color: "#4a9eff" },
          { l: "Platform Rating", v: "4.8 ⭐", color: "#ffc107" },
          { l: "Reported", v: "14", color: "#ff4757" },
          { l: "Auto-Flagged", v: "7", color: "#b47aff" },
        ].map((s) => (
          <div key={s.l} className={styles['kpiCard']} style={{ "--accent": s.color } as React.CSSProperties}>
            <div className={styles['syneFont']} style={{ fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.v}</div>
            <div className={styles['metricLabel']}>{s.l}</div>
          </div>
        ))}
      </div>
      <div className={styles['card']}>
        {REVIEWS.map((r, i) => (
          <div
            key={r.id}
            style={{
              padding: "20px 24px",
              borderBottom: i < REVIEWS.length - 1 ? "1px solid #1a3158" : "none",
              background: r.reported ? "rgba(255,71,87,0.03)" : undefined,
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3 items-center">
                <Avatar name={r.student} size={32} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#e8f0fe" }}>{r.student}</div>
                  <div style={{ fontSize: 12, color: "#3d5a80" }}>{r.course} · {r.date}</div>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                {r.reported && <Badge variant="red">🚩 Reported</Badge>}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} viewBox="0 0 24 24" width={14} height={14} fill={s <= r.rating ? "#ffc107" : "#1a3158"}>
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: "#7a9cc4", marginBottom: 14, lineHeight: 1.5, fontStyle: r.reported ? "italic" : undefined }}>
              {r.comment}
            </p>
            <div className="flex gap-2">
              <button className={`${styles['btn']} ${styles['btnSuccess']}`} style={{ fontSize: 12, padding: "5px 14px" }}>
                <Check size={12} color="#00e5a0" /> Approve
              </button>
              <button className={`${styles['btn']} ${styles['btnDanger']}`} style={{ fontSize: 12, padding: "5px 14px" }}>
                <Trash2 size={12} color="#ff4757" /> Delete
              </button>
              {!r.reported && (
                <button className={`${styles['btn']} ${styles['btnGhost']}`} style={{ fontSize: 12, padding: "5px 14px" }}>
                  <Flag size={12} /> Flag
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
