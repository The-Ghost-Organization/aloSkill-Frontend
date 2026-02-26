"use client";

import styles from "../AdminDashboard.module.css";
import { Eye, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Avatar, Badge, ProgressBar, SectionHeader, SlidePanel } from "../Components";
import { STUDENTS } from "../Data";

const badgeVariant: Record<string, string> = { Platinum: "purple", Gold: "gold", None: "gray" };

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<(typeof STUDENTS)[0] | null>(null);
  const [filter, setFilter] = useState("all");

  const filtered = STUDENTS.filter(s => {
    const m =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    if (filter === "active") return m && s.status === "Active";
    if (filter === "suspended") return m && s.status === "Suspended";
    return m;
  });

  return (
    <div className={styles["pageEnter"]}>
      <SectionHeader
        title='Student Management'
        sub={`${STUDENTS.length} registered students`}
        action={
          <button className={`${styles["btn"]} ${styles["btnPrimary"]}`}>
            <Plus
              size={14}
              color='white'
            />
            Add Student
          </button>
        }
      />

      {/* Filters */}
      <div className='flex gap-3 mb-5 items-center flex-wrap'>
        <div
          className='relative flex-1'
          style={{ maxWidth: 360 }}
        >
          <Search
            size={14}
            color='#3d5a80'
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            className={styles["input"]}
            placeholder='Search students...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div className={styles["tabNav"]}>
          {["all", "active", "suspended"].map(f => (
            <button
              key={f}
              className={`${styles["tabItem"]} ${filter === f ? styles["tabItemActive"] : styles["tabItemInactive"]}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <select
          className={styles["select"]}
          style={{ width: "auto" }}
        >
          <option>Sort: Enrollments</option>
          <option>Sort: Spend</option>
          <option>Sort: Completion</option>
        </select>
      </div>

      <div className={styles["card"]}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles["table"]}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Phone</th>
                <th>Courses</th>
                <th>Spend</th>
                <th>Completion</th>
                <th>Badge</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className='flex items-center gap-3'>
                      <Avatar
                        name={s.name}
                        size={34}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: "#3d5a80" }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td
                    className={styles["monoText"]}
                    style={{ color: "#7a9cc4", fontSize: 12 }}
                  >
                    {s.phone}
                  </td>
                  <td>
                    <Badge variant='blue'>{s.courses}</Badge>
                  </td>
                  <td
                    className={styles["monoText"]}
                    style={{ fontWeight: 600, color: "#00e5a0" }}
                  >
                    {s.spend}
                  </td>
                  <td>
                    <div
                      className='flex items-center gap-2'
                      style={{ width: 120 }}
                    >
                      <ProgressBar value={s.pct} />
                      <span
                        className={styles["monoText"]}
                        style={{ fontSize: 11, color: "#7a9cc4", minWidth: 28 }}
                      >
                        {s.pct}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <Badge variant={badgeVariant[s.badge]}>{s.badge}</Badge>
                  </td>
                  <td>
                    <Badge variant={s.status === "Active" ? "green" : "red"}>{s.status}</Badge>
                  </td>
                  <td
                    className={styles["monoText"]}
                    style={{ color: "#3d5a80", fontSize: 12 }}
                  >
                    {s.joined}
                  </td>
                  <td>
                    <button
                      className={`${styles["btn"]} ${styles["btnGhost"]}`}
                      style={{ padding: "5px 10px" }}
                      onClick={() => setPanel(s)}
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className='flex justify-between items-center'
          style={{ padding: "14px 18px", borderTop: "1px solid #1a3158" }}
        >
          <span
            style={{ fontSize: 12, color: "#3d5a80" }}
          >
            Showing {filtered.length} of {STUDENTS.length}
          </span>
          <div className='flex gap-1'>
            {[1, 2, 3].map(p => (
              <button
                key={p}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  border: "1px solid #1a3158",
                  background: p === 1 ? "#da7c36" : "#0d1f3c",
                  color: p === 1 ? "white" : "#7a9cc4",
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Panel */}
      {panel && (
        <SlidePanel
          onClose={() => setPanel(null)}
          title='Student Profile'
        >
          <div className='flex gap-4 mb-6'>
            <Avatar
              name={panel.name}
              size={56}
            />
            <div>
              <div
                style={{ fontWeight: 700, fontSize: 18, color: "#e8f0fe" }}
              >
                {panel.name}
              </div>
              <div style={{ fontSize: 13, color: "#3d5a80" }}>{panel.email}</div>
              <div className='flex gap-2 mt-2'>
                <Badge variant={panel.status === "Active" ? "green" : "red"}>{panel.status}</Badge>
                <Badge variant={badgeVariant[panel.badge]}>{panel.badge}</Badge>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {[
              { l: "Courses", v: panel.courses },
              { l: "Total Spend", v: panel.spend },
              { l: "Completion", v: `${panel.pct}%` },
            ].map(s => (
              <div
                key={s.l}
                style={{
                  background: "#0d1f3c",
                  border: "1px solid #1a3158",
                  borderRadius: 10,
                  padding: "14px",
                  textAlign: "center",
                }}
              >
                <div
                  className={styles["syneFont"]}
                  style={{ fontSize: 20, fontWeight: 700, color: "#da7c36" }}
                >
                  {s.v}
                </div>
                <div
                  className={styles["metricLabel"]}
                  style={{ marginTop: 4 }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 20 }}>
            <div
              className={styles["metricLabel"]}
              style={{ marginBottom: 8 }}
            >
              Completion Progress
            </div>
            <ProgressBar value={panel.pct} />
          </div>
          <div
            style={{
              background: "#0d1f3c",
              borderRadius: 12,
              border: "1px solid #1a3158",
              padding: 16,
              marginBottom: 20,
            }}
          >
            {[
              ["Phone", panel.phone],
              ["Joined", panel.joined],
              ["Badge", panel.badge],
            ].map(([k, v]) => (
              <div
                key={k}
                className='flex justify-between'
                style={{ padding: "8px 0", borderBottom: "1px solid #1a3158" }}
              >
                <span className={styles["metricLabel"]}>{k}</span>
                <span style={{ fontSize: 13, color: "#e8f0fe", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}
          >
            <button className={`${styles["btn"]} ${styles["btnPrimary"]} justify-center`}>
              Manual Enroll
            </button>
            <button className={`${styles["btn"]} ${styles["btnGhost"]} justify-center`}>
              Assign Badge
            </button>
            <button className={`${styles["btn"]} ${styles["btnDanger"]} justify-center`}>
              {panel.status === "Active" ? "Suspend Account" : "Activate Account"}
            </button>
            <button className={`${styles["btn"]} ${styles["btnGhost"]} justify-center`}>
              Trigger Refund
            </button>
          </div>
          <div>
            <div
              className={styles["metricLabel"]}
              style={{ marginBottom: 8 }}
            >
              Admin Note (Private)
            </div>
            <textarea
              className={styles["textarea"]}
              rows={3}
              placeholder='Add internal note...'
            />
            <button
              className={`${styles["btn"]} ${styles["btnPrimary"]}`}
              style={{ marginTop: 8 }}
            >
              Save Note
            </button>
          </div>
        </SlidePanel>
      )}
    </div>
  );
}
