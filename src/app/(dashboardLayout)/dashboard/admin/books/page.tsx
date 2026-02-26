"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import styles from "../AdminDashboard.module.css";
import { Badge, SectionHeader } from "../Components";
import { BOOKS } from "../Data";

export default function BooksPage() {
  return (
    <div className={styles["pageEnter"]}>
      <SectionHeader
        title='Books & Products'
        sub='Manage digital and physical book inventory'
        action={
          <Link href='/dashboard/admin/books/upload-books'>
            <button className={`${styles["btn"]} ${styles["btnPrimary"]}`}>
              <Plus
                size={14}
                color='white'
              />{" "}
              Add Book
            </button>
          </Link>
        }
      />
      <div
        className={`${styles["kpiGrid4"]}`}
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}
      >
        {[
          { l: "Total Books", v: "312", color: "#4a9eff" },
          { l: "Digital Sales", v: "1,160", color: "#00e5a0" },
          { l: "Physical Stock", v: "148", color: "#da7c36" },
          { l: "Total Revenue", v: "$12,140", color: "#b47aff" },
        ].map(s => (
          <div
            key={s.l}
            className={styles["kpiCard"]}
            style={{ "--accent": s.color } as React.CSSProperties}
          >
            <div
              className={styles["syneFont"]}
              style={{ fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 4 }}
            >
              {s.v}
            </div>
            <div className={styles["metricLabel"]}>{s.l}</div>
          </div>
        ))}
      </div>
      <div className={styles["card"]}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles["table"]}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Type</th>
                <th>Price</th>
                <th>Sales</th>
                <th>Revenue</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {BOOKS.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.title}</td>
                  <td style={{ color: "#7a9cc4" }}>{b.author}</td>
                  <td>
                    <Badge variant={b.type === "Digital" ? "blue" : "orange"}>{b.type}</Badge>
                  </td>
                  <td
                    className={styles["monoText"]}
                    style={{ fontWeight: 600 }}
                  >
                    ${b.price}
                  </td>
                  <td>
                    <Badge variant='gray'>{b.sales}</Badge>
                  </td>
                  <td
                    className={styles["monoText"]}
                    style={{ color: "#00e5a0", fontWeight: 600 }}
                  >
                    ${b.rev.toLocaleString()}
                  </td>
                  <td
                    className={styles["monoText"]}
                    style={{
                      color: b.stock === null ? "#3d5a80" : b.stock < 20 ? "#ff4757" : "#7a9cc4",
                    }}
                  >
                    {b.stock === null ? "∞" : b.stock}
                  </td>
                  <td>
                    <Badge variant={b.status === "Approved" ? "green" : "orange"}>{b.status}</Badge>
                  </td>
                  <td>
                    <div className='flex gap-2'>
                      <button
                        className={`${styles["btn"]} ${styles["btnGhost"]}`}
                        style={{ padding: "5px 10px", fontSize: 12 }}
                      >
                        Edit
                      </button>
                      {b.status === "Pending" && (
                        <button
                          className={`${styles["btn"]} ${styles["btnSuccess"]}`}
                          style={{ padding: "5px 10px", fontSize: 12 }}
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
