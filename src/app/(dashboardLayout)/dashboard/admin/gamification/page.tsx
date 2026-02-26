"use client";

import { Plus } from "lucide-react";
import { Avatar, Badge, SectionHeader } from "../Components";
import styles from "../AdminDashboard.module.css";

const leaderboard = [
  { rank: 1, name: "Fatima Al-Hassan", pts: 4820, streak: 42, medal: "🥇" },
  { rank: 2, name: "Priya Sharma", pts: 4210, streak: 38, medal: "🥈" },
  { rank: 3, name: "Yuki Tanaka", pts: 3940, streak: 31, medal: "🥉" },
  { rank: 4, name: "Aisha Rahman", pts: 3480, streak: 28, medal: "🎖️" },
  { rank: 5, name: "Carlos Mendez", pts: 2100, streak: 14, medal: "🎖️" },
];

const achievements = [
  { name: "First Course", icon: "🌱", desc: "Complete first course", pts: 100 },
  { name: "Speed Learner", icon: "⚡", desc: "Finish course in under 3 days", pts: 250 },
  { name: "Perfect Score", icon: "💯", desc: "Score 100% on any quiz", pts: 300 },
  { name: "7-Day Streak", icon: "🔥", desc: "Learn 7 days in a row", pts: 200 },
  { name: "Top Reviewer", icon: "⭐", desc: "Write 10 helpful reviews", pts: 150 },
];

export default function GamificationPage() {
  return (
    <div className={styles['pageEnter']}>
      <SectionHeader title="Gamification" sub="Leaderboards, points, achievements and rewards" />
      <div className={`${styles['kpiGrid4']}`} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { l: "Active Streaks", v: "3,240", icon: "🔥", color: "#da7c36" },
          { l: "Achievements Earned", v: "18,420", icon: "🏆", color: "#ffc107" },
          { l: "Points Redeemed", v: "124,800", icon: "⭐", color: "#b47aff" },
          { l: "Daily Active", v: "2,840", icon: "⚡", color: "#4a9eff" },
        ].map((s) => (
          <div key={s.l} className={styles['kpiCard']} style={{ "--accent": s.color, textAlign: "center" } as React.CSSProperties}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
            <div className={styles['syneFont']} style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.v}</div>
            <div className={styles['metricLabel']} style={{ marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className={`${styles['chartRow2col']}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className={styles['card']} style={{ padding: 24 }}>
          <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 20 }}>
            🏆 Student Leaderboard
          </div>
          {leaderboard.map((s, i) => (
            <div key={s.rank} className="flex items-center gap-4" style={{ padding: "12px 0", borderBottom: i < leaderboard.length - 1 ? "1px solid #1a3158" : "none" }}>
              <div style={{ fontSize: 20, width: 28, textAlign: "center" }}>{s.medal}</div>
              <Avatar name={s.name} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#e8f0fe" }}>{s.name}</div>
                <div className={styles['monoText']} style={{ fontSize: 11, color: "#3d5a80" }}>🔥 {s.streak}-day streak</div>
              </div>
              <div className={styles['monoText']} style={{ fontWeight: 700, fontSize: 14, color: "#da7c36" }}>
                {s.pts.toLocaleString()} pts
              </div>
            </div>
          ))}
        </div>

        <div className={styles['card']} style={{ padding: 24 }}>
          <div className="flex justify-between items-center mb-5">
            <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe" }}>
              🎯 Achievements
            </div>
            <button className={`${styles['btn']} ${styles['btnPrimary']}`} style={{ fontSize: 12, padding: "6px 12px" }}>
              <Plus size={12} color="white" /> Add
            </button>
          </div>
          {achievements.map((a, i) => (
            <div key={a.name} className="flex items-center gap-3" style={{ padding: "11px 0", borderBottom: i < achievements.length - 1 ? "1px solid #1a3158" : "none" }}>
              <div style={{ fontSize: 22 }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#e8f0fe" }}>{a.name}</div>
                <div style={{ fontSize: 11, color: "#3d5a80" }}>{a.desc}</div>
              </div>
              <Badge variant="gold">+{a.pts} pts</Badge>
              <button className={`${styles['btn']} ${styles['btnGhost']}`} style={{ padding: "4px 8px", fontSize: 11 }}>Edit</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
