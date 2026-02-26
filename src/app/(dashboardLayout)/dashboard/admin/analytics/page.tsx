"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { SectionHeader, CustomTooltip } from "../Components";
import styles from "../AdminDashboard.module.css";

const completionData = [
  { cat: "Dev", v: 74 },
  { cat: "Design", v: 68 },
  { cat: "Data", v: 81 },
  { cat: "Marketing", v: 55 },
  { cat: "Business", v: 63 },
];

const reports = [
  { name: "Instructor Revenue Report", size: "128 KB", updated: "Today" },
  { name: "Student Activity Report", size: "342 KB", updated: "Today" },
  { name: "Course Completion Report", size: "94 KB", updated: "Yesterday" },
  { name: "Payment Report", size: "216 KB", updated: "Today" },
  { name: "Coupon Usage Report", size: "48 KB", updated: "Feb 18" },
  { name: "Refund Analysis Report", size: "72 KB", updated: "Feb 17" },
];

export default function AnalyticsPage() {
  return (
    <div className={styles['pageEnter']}>
      <SectionHeader
        title="Analytics & Reports"
        sub="Deep insights and downloadable CSV reports"
        action={
          <div className="flex gap-3">
            <button className={`${styles['btn']} ${styles['btnGhost']}`}>
              <Download size={13} /> Export CSV
            </button>
            <button className={`${styles['btn']} ${styles['btnPrimary']}`}>
              <Download size={13} color="white" /> Export PDF
            </button>
          </div>
        }
      />
      <div className={`${styles['kpiGrid3']}`} style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {reports.map((r) => (
          <div key={r.name} className={styles['card']} style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#e8f0fe", marginBottom: 3 }}>{r.name}</div>
              <div className={styles['monoText']} style={{ fontSize: 11, color: "#3d5a80" }}>{r.size} · {r.updated}</div>
            </div>
            <button className={`${styles['btn']} ${styles['btnGhost']}`} style={{ padding: "6px 12px", fontSize: 12, flexShrink: 0 }}>
              <Download size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className={styles['card']} style={{ padding: 24 }}>
        <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 4 }}>
          Course Completion Rate by Category
        </div>
        <div className={styles['metricLabel']} style={{ marginBottom: 24 }}>Current month performance</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={completionData} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a3158" />
            <XAxis dataKey="cat" tick={{ fontSize: 11, fill: "#3d5a80", fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#3d5a80", fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="v" fill="#da7c36" radius={[6, 6, 0, 0]} name="Completion %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
