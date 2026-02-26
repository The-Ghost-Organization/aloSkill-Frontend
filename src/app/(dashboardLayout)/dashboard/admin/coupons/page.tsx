"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge, SectionHeader, ProgressBar } from "../Components";
import styles from "../AdminDashboard.module.css";
import { COUPONS } from "../Data";

export default function CouponsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className={styles['pageEnter']}>
      <SectionHeader
        title="Coupons & Discounts"
        sub="Create and manage promotional campaigns"
        action={
          <button className={`${styles['btn']} ${styles['btnPrimary']}`} onClick={() => setShowForm(!showForm)}>
            <Plus size={14} color="white" /> New Coupon
          </button>
        }
      />

      {showForm && (
        <div className={styles['card']} style={{ padding: 24, marginBottom: 20, borderColor: "rgba(218,124,54,0.3)" }}>
          <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 20 }}>Create New Coupon</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[["Coupon Code", "text", "e.g. SAVE20"], ["Discount Value", "number", "e.g. 20"], ["Usage Limit", "number", "Blank = unlimited"]].map(([l, t, p]) => (
              <div key={String(l)}>
                <div className={styles['metricLabel']} style={{ marginBottom: 6 }}>{l}</div>
                <input className={styles['input']} type={String(t)} placeholder={String(p)} />
              </div>
            ))}
            <div>
              <div className={styles['metricLabel']} style={{ marginBottom: 6 }}>Type</div>
              <select className={styles['select']}><option>Percentage</option><option>Flat</option></select>
            </div>
            <div>
              <div className={styles['metricLabel']} style={{ marginBottom: 6 }}>Expiry Date</div>
              <input className={styles['input']} type="date" />
            </div>
            <div>
              <div className={styles['metricLabel']} style={{ marginBottom: 6 }}>Scope</div>
              <select className={styles['select']}><option>Global</option><option>Instructor-specific</option><option>Referral</option></select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className={`${styles['btn']} ${styles['btnPrimary']}`}>Create Coupon</button>
            <button className={`${styles['btn']} ${styles['btnGhost']}`} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className={styles['card']}>
        <table className={styles['table']}>
          <thead>
            <tr><th>Code</th><th>Type</th><th>Discount</th><th>Usage</th><th>Scope</th><th>Expires</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {COUPONS.map((c) => (
              <tr key={c.code}>
                <td className={styles['monoText']} style={{ fontWeight: 700, color: "#da7c36", fontSize: 14 }}>{c.code}</td>
                <td><Badge variant="blue">{c.type}</Badge></td>
                <td className={styles['monoText']} style={{ fontWeight: 700, color: "#00e5a0" }}>{c.value}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={c.limit ? (c.used / c.limit) * 100 : 50} />
                    <span className={styles['monoText']} style={{ fontSize: 11, color: "#7a9cc4", minWidth: 50 }}>
                      {c.used}/{c.limit ?? "∞"}
                    </span>
                  </div>
                </td>
                <td><Badge variant="gray">{c.scope}</Badge></td>
                <td className={styles['monoText']} style={{ fontSize: 12, color: "#3d5a80" }}>{c.expires}</td>
                <td><Badge variant={c.status === "Active" ? "green" : "red"}>{c.status}</Badge></td>
                <td>
                  <div className="flex gap-2">
                    <button className={`${styles['btn']} ${styles['btnGhost']}`} style={{ padding: "5px 10px", fontSize: 12 }}>
                      <Edit size={12} />
                    </button>
                    <button className={`${styles['btn']} ${styles['btnDanger']}`} style={{ padding: "5px 10px", fontSize: 12 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
