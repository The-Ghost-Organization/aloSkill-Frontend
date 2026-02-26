"use client";

import { useState } from "react";
import { Badge, SectionHeader } from "../Components";
import styles from "../AdminDashboard.module.css";

const history = [
  { title: "February Newsletter", type: "Email", sent: "Feb 15", recipients: "14,820", opens: "8,240" },
  { title: "New Course: Python AI", type: "Push", sent: "Feb 12", recipients: "9,400", opens: "3,180" },
  { title: "Maintenance Notice", type: "In-App", sent: "Feb 10", recipients: "14,820", opens: "14,820" },
  { title: "Instructor Payout Week", type: "Email", sent: "Feb 7", recipients: "348", opens: "302" },
];

export default function NotificationsPage() {
  const [channel, setChannel] = useState("email");

  return (
    <div className={styles['pageEnter']}>
      <SectionHeader title="Notification Center" sub="Send broadcasts, alerts and custom notifications" />
      <div className={`${styles['chartRow2col']}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className={styles['card']} style={{ padding: 24 }}>
          <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 20 }}>
            Compose & Send
          </div>
          <div className={styles['metricLabel']} style={{ marginBottom: 8 }}>Channel</div>
          <div className="flex gap-2 mb-4">
            {[["email", "✉️ Email"], ["push", "📱 Push"], ["in-app", "🔔 In-App"]].map(([id, label]) => (
              <button
                key={id}
                className={`${styles['btn']} ${channel === id ? styles['btnPrimary'] : styles['btnGhost']}`}
                style={{ flex: 1, justifyContent: "center", fontSize: 12 }}
                onClick={() => setChannel(id as string)}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <div className={styles['metricLabel']} style={{ marginBottom: 8 }}>Target Audience</div>
            <select className={styles['select']}>
              <option>All Users</option>
              <option>All Students</option>
              <option>All Instructors</option>
              <option>Specific User</option>
            </select>
          </div>
          {channel === "email" && (
            <div style={{ marginBottom: 14 }}>
              <div className={styles['metricLabel']} style={{ marginBottom: 8 }}>Subject Line</div>
              <input className={styles['input']} placeholder="Enter email subject..." />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <div className={styles['metricLabel']} style={{ marginBottom: 8 }}>Message</div>
            <textarea className={styles['textarea']} rows={4} placeholder="Write your notification..." />
          </div>
          <div className="flex gap-3">
            <button className={`${styles['btn']} ${styles['btnPrimary']}`} style={{ flex: 1, justifyContent: "center" }}>Send Now</button>
            <button className={`${styles['btn']} ${styles['btnGhost']}`}>Schedule</button>
          </div>
        </div>

        <div className={styles['card']} style={{ padding: 24 }}>
          <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 20 }}>
            Recent Broadcasts
          </div>
          {history.map((h) => (
            <div key={h.title} style={{ background: "#070f1e", borderRadius: 10, border: "1px solid #1a3158", padding: "14px", marginBottom: 10 }}>
              <div className="flex justify-between items-center mb-2">
                <div style={{ fontWeight: 600, fontSize: 13, color: "#e8f0fe" }}>{h.title}</div>
                <Badge variant={h.type === "Email" ? "blue" : h.type === "Push" ? "orange" : "green"}>{h.type}</Badge>
              </div>
              <div className="flex gap-4">
                <span className={styles['monoText']} style={{ fontSize: 11, color: "#3d5a80" }}>📅 {h.sent}</span>
                <span className={styles['monoText']} style={{ fontSize: 11, color: "#3d5a80" }}>👥 {h.recipients}</span>
                <span className={styles['monoText']} style={{ fontSize: 11, color: "#3d5a80" }}>👁 {h.opens} opens</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
