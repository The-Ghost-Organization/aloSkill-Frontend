"use client";

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { Toggle, SectionHeader } from "../Components";
import styles from "../AdminDashboard.module.css";

const radarData = [
  { s: "Rating", v: 90 },
  { s: "Revenue", v: 85 },
  { s: "Completion", v: 72 },
  { s: "Feedback", v: 88 },
  { s: "Activity", v: 78 },
];

const badgeRules = [
  { badge: "Gold", color: "#ffc107", criteria: "Rating ≥ 4.5 · Revenue ≥ $5K · Completion ≥ 70%" },
  { badge: "Platinum", color: "#b47aff", criteria: "Rating ≥ 4.8 · Revenue ≥ $20K · Completion ≥ 85%" },
  { badge: "Premium", color: "#da7c36", criteria: "Manual admin assignment only" },
];

export default function BadgesPage() {
  return (
    <div className={styles['pageEnter']}>
      <SectionHeader title="Badges & Ranking System" sub="Configure automated badge assignment and performance criteria" />
      <div className={`${styles['chartRow2col']}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className={styles['card']} style={{ padding: 24 }}>
          <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 20 }}>Badge Rules</div>
          {badgeRules.map((b) => (
            <div key={b.badge} style={{ padding: "16px", borderRadius: 12, background: "#070f1e", border: `1px solid ${b.color}30`, marginBottom: 12 }}>
              <div className="flex justify-between items-center mb-2">
                <div style={{ fontWeight: 700, fontSize: 14, color: b.color }}>🏅 {b.badge} Badge</div>
                <button className={`${styles['btn']} ${styles['btnGhost']}`} style={{ padding: "4px 10px", fontSize: 12 }}>Edit</button>
              </div>
              <div className={styles['monoText']} style={{ fontSize: 12, color: "#7a9cc4" }}>{b.criteria}</div>
            </div>
          ))}
          <button className={`${styles['btn']} ${styles['btnPrimary']}`} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>+ Add Badge Rule</button>
        </div>
        <div className={styles['card']} style={{ padding: 24 }}>
          <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 4 }}>Instructor Score Radar</div>
          <div className={styles['metricLabel']} style={{ marginBottom: 16 }}>James Carter — Platinum</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1a3158" />
              <PolarAngleAxis dataKey="s" tick={{ fontSize: 11, fill: "#7a9cc4", fontFamily: "'DM Mono',monospace" }} />
              <Radar dataKey="v" stroke="#da7c36" fill="#da7c36" fillOpacity={0.15} strokeWidth={2} name="Score" />
              <Tooltip contentStyle={{ background: "#0d1f3c", border: "1px solid #1a3158", borderRadius: 8, color: "#e8f0fe" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className={styles['card']} style={{ padding: 24 }}>
        <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 20 }}>Automation Controls</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            ["Auto Badge Upgrade", "Upgrade when criteria met", true],
            ["Auto Badge Downgrade", "Downgrade on performance drop", true],
            ["Manual Override", "Admin can override automation", true],
          ].map(([l, s, on]) => (
            <div key={String(l)} style={{ background: "#070f1e", border: "1px solid #1a3158", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#e8f0fe", marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 11, color: "#3d5a80" }}>{s}</div>
              </div>
              <Toggle on={Boolean(on)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
