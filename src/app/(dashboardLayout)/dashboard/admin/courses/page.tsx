"use client";

import styles from "../AdminDashboard.module.css";
import { Archive, Eye, Home, Search } from "lucide-react";
import { useState } from "react";
import { Badge, ProgressBar, SectionHeader } from "../Components";
import { COURSES } from "../Data";

const statusV: Record<string, string> = {
  Approved: "green",
  Pending: "orange",
  Draft: "gray",
  Rejected: "red",
};

export default function CoursesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = COURSES.filter(c => {
    const m =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    return m && (statusFilter === "all" || c.status.toLowerCase() === statusFilter);
  });

  const counts = {
    all: COURSES.length,
    approved: COURSES.filter(c => c.status === "Approved").length,
    pending: COURSES.filter(c => c.status === "Pending").length,
    draft: COURSES.filter(c => c.status === "Draft").length,
    rejected: COURSES.filter(c => c.status === "Rejected").length,
  };

  return (
    <div className={styles["pageEnter"]}>
      <SectionHeader
        title='Course Management'
        sub='Review, approve and curate all courses'
      />
      <div className='flex gap-3 mb-5 items-center flex-wrap'>
        <div className={styles["tabNav"]}>
          {(["all", "approved", "pending", "draft", "rejected"] as const).map(s => (
            <button
              key={s}
              className={`${styles["tabItem"]} ${statusFilter === s ? styles["tabItemActive"] : styles["tabItemInactive"]}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}{" "}
              <span style={{ opacity: 0.6, fontSize: 11 }}>({counts[s]})</span>
            </button>
          ))}
        </div>
        <div className='relative'>
          <Search
            size={14}
            color='#3d5a80'
            style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            className={styles["input"]}
            placeholder='Search courses...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34, width: 220 }}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        {filtered.map(c => (
          <div
            key={c.id}
            className={styles["card"]}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #0a1628, #0d1f3c)",
                padding: "16px 20px",
                borderBottom: "1px solid #1a3158",
                position: "relative",
              }}
            >
              {c.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "#da7c36",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderBottomLeftRadius: 8,
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: "0.5px",
                  }}
                >
                  FEATURED
                </div>
              )}
              <div className='flex justify-between items-center'>
                <Badge variant={statusV[c.status]}>{c.status}</Badge>
                <span
                  className={styles["monoText"]}
                  style={{ fontSize: 11, color: "#3d5a80" }}
                >
                  {c.cat}
                </span>
              </div>
            </div>
            <div style={{ padding: "18px 20px" }}>
              <div
                className={styles["syneFont"]}
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#e8f0fe",
                  marginBottom: 4,
                  lineHeight: 1.3,
                }}
              >
                {c.title}
              </div>
              <div style={{ fontSize: 12, color: "#3d5a80", marginBottom: 16 }}>
                by {c.instructor}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                {[
                  { l: "Students", v: c.enr.toLocaleString() },
                  { l: "Revenue", v: c.rev ? `$${c.rev.toLocaleString()}` : "$0" },
                  { l: "Rating", v: c.rating || "—" },
                  { l: "Price", v: `$${c.price}` },
                ].map(s => (
                  <div
                    key={s.l}
                    style={{ textAlign: "center" }}
                  >
                    <div
                      className={styles["monoText"]}
                      style={{ fontSize: 14, fontWeight: 700, color: "#e8f0fe" }}
                    >
                      {s.v}
                    </div>
                    <div
                      className={styles["metricLabel"]}
                      style={{ marginTop: 2 }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
              {c.pct > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div className='flex justify-between mb-1'>
                    <span className={styles["metricLabel"]}>Completion Rate</span>
                    <span
                      className={styles["monoText"]}
                      style={{ fontSize: 11, color: "#da7c36" }}
                    >
                      {c.pct}%
                    </span>
                  </div>
                  <ProgressBar value={c.pct} />
                </div>
              )}
              <div className='flex gap-2 flex-wrap'>
                <button
                  className={`${styles["btn"]} ${styles["btnGhost"]} flex-1 justify-center`}
                  style={{ fontSize: 12 }}
                >
                  <Eye size={12} /> View
                </button>
                {c.status === "Pending" && (
                  <>
                    <button
                      className={`${styles["btn"]} ${styles["btnSuccess"]} flex-1 justify-center`}
                      style={{ fontSize: 12 }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className={`${styles["btn"]} ${styles["btnDanger"]} flex-1 justify-center`}
                      style={{ fontSize: 12 }}
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
                {c.status === "Approved" && (
                  <>
                    <button
                      className={`${styles["btn"]} ${styles["btnGhost"]} flex-1 justify-center`}
                      style={{ fontSize: 12 }}
                    >
                      <Home size={12} /> Feature
                    </button>
                    <button
                      className={`${styles["btn"]} ${styles["btnGhost"]} flex-1 justify-center`}
                      style={{ fontSize: 12 }}
                    >
                      <Archive size={12} /> Archive
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
