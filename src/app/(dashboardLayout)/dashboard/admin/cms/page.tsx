"use client";

import { SectionHeader, Badge } from "../Components";
import styles from "../AdminDashboard.module.css";

const sections = [
  { title: "Homepage Banner", icon: "🖼️", desc: "Hero banners and call-to-actions", count: 3 },
  { title: "Featured Courses", icon: "⭐", desc: "Spotlight section on homepage", count: 6 },
  { title: "Blog Management", icon: "📝", desc: "Articles and announcements", count: 14 },
  { title: "Testimonials", icon: "💬", desc: "Student success stories", count: 8 },
  { title: "FAQ Management", icon: "❓", desc: "Common questions & answers", count: 24 },
  { title: "Static Pages", icon: "📄", desc: "Terms, Privacy, Refund Policy", count: 5 },
  { title: "SEO Settings", icon: "🔍", desc: "Meta tags and optimization", count: null },
  { title: "Email Templates", icon: "✉️", desc: "Welcome, receipt, approval", count: 12 },
];

export default function CMSPage() {
  return (
    <div className={styles['pageEnter']}>
      <SectionHeader title="CMS & Content" sub="Manage all website content, pages and marketing" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {sections.map((s) => (
          <div
            key={s.title}
            className={styles['card']}
            style={{ padding: 22, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(218,124,54,0.3)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#1a3158";
              (e.currentTarget as HTMLElement).style.transform = "none";
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
            <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 5 }}>
              {s.title}
            </div>
            <div style={{ fontSize: 12, color: "#3d5a80", marginBottom: 14, lineHeight: 1.4 }}>{s.desc}</div>
            <div className="flex justify-between items-center">
              {s.count !== null && <Badge variant="gray">{s.count} items</Badge>}
              <button className={`${styles['btn']} ${styles['btnGhost']}`} style={{ fontSize: 12, padding: "5px 12px", marginLeft: "auto" }}>
                Manage →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
