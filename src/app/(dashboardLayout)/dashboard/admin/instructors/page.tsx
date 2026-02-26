"use client";

import styles from "../AdminDashboard.module.css";
import { DollarSign, Eye } from "lucide-react";
import { useState } from "react";
import { Avatar, Badge, SectionHeader, SlidePanel } from "../Components";
import { INSTRUCTORS } from "../Data";

const badgeV: Record<string, string> = { Platinum: "purple", Gold: "gold", None: "gray" };

export default function InstructorsPage() {
  const [panel, setPanel] = useState<(typeof INSTRUCTORS)[0] | null>(null);
  const [comm, setComm] = useState(30);

  return (
    <div className={styles["pageEnter"]}>
      <SectionHeader
        title='Instructor Management'
        sub={`${INSTRUCTORS.length} instructors · ${INSTRUCTORS.filter(i => i.status === "Pending").length} pending`}
      />

      <div className={styles["card"]}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles["table"]}>
            <thead>
              <tr>
                <th>Instructor</th>
                <th>Courses</th>
                <th>Students</th>
                <th>Revenue</th>
                <th>Rating</th>
                <th>Commission</th>
                <th>Badge</th>
                <th>KYC</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {INSTRUCTORS.map(inst => (
                <tr key={inst.id}>
                  <td>
                    <div className='flex items-center gap-3'>
                      <Avatar
                        name={inst.name}
                        size={34}
                        gradient='135deg, #da7c36, #d15100'
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{inst.name}</div>
                        <div style={{ fontSize: 12, color: "#3d5a80" }}>{inst.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant='blue'>{inst.courses}</Badge>
                  </td>
                  <td
                    className={styles["monoText"]}
                    style={{ color: "#7a9cc4" }}
                  >
                    {inst.students.toLocaleString()}
                  </td>
                  <td
                    className={styles["monoText"]}
                    style={{ fontWeight: 600, color: "#00e5a0" }}
                  >
                    ${inst.revenue.toLocaleString()}
                  </td>
                  <td>
                    <Badge variant='gold'>⭐ {inst.rating}</Badge>
                  </td>
                  <td>
                    <Badge variant='orange'>{inst.commission}%</Badge>
                  </td>
                  <td>
                    <Badge variant={badgeV[inst.badge]}>{inst.badge}</Badge>
                  </td>
                  <td>
                    <Badge variant={inst.kyc === "Verified" ? "green" : "gray"}>{inst.kyc}</Badge>
                  </td>
                  <td>
                    <Badge variant={inst.status === "Approved" ? "green" : "orange"}>
                      {inst.status}
                    </Badge>
                  </td>
                  <td>
                    <div className='flex gap-2'>
                      <button
                        className={`${styles["btn"]} ${styles["btnGhost"]}`}
                        style={{ padding: "5px 10px" }}
                        onClick={() => {
                          setPanel(inst);
                          setComm(inst.commission);
                        }}
                      >
                        <Eye size={13} />
                      </button>
                      {inst.status === "Pending" && (
                        <>
                          <button
                            className={`${styles["btn"]} ${styles["btnSuccess"]}`}
                            style={{ padding: "5px 10px" }}
                          >
                            ✓
                          </button>
                          <button
                            className={`${styles["btn"]} ${styles["btnDanger"]}`}
                            style={{ padding: "5px 10px" }}
                          >
                            ✗
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {panel && (
        <SlidePanel
          onClose={() => setPanel(null)}
          title='Instructor Profile'
        >
          <div className='flex gap-4 mb-6'>
            <Avatar
              name={panel.name}
              size={56}
              gradient='135deg, #da7c36, #d15100'
            />
            <div>
              <div
                className={styles["syneFont"]}
                style={{ fontWeight: 700, fontSize: 18, color: "#e8f0fe" }}
              >
                {panel.name}
              </div>
              <div style={{ fontSize: 13, color: "#3d5a80" }}>{panel.email}</div>
              <div className='flex gap-2 mt-2 flex-wrap'>
                <Badge variant={panel.status === "Approved" ? "green" : "orange"}>
                  {panel.status}
                </Badge>
                <Badge variant={badgeV[panel.badge]}>{panel.badge}</Badge>
                <Badge variant={panel.kyc === "Verified" ? "blue" : "gray"}>KYC: {panel.kyc}</Badge>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {[
              { l: "Courses", v: panel.courses },
              { l: "Students", v: panel.students.toLocaleString() },
              { l: "Revenue", v: `$${panel.revenue.toLocaleString()}` },
              { l: "Rating", v: `⭐ ${panel.rating}` },
            ].map(s => (
              <div
                key={s.l}
                style={{
                  background: "#0d1f3c",
                  border: "1px solid #1a3158",
                  borderRadius: 10,
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  className={styles["syneFont"]}
                  style={{ fontSize: 15, fontWeight: 700, color: "#da7c36" }}
                >
                  {s.v}
                </div>
                <div
                  className={styles["metricLabel"]}
                  style={{ marginTop: 3 }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
          {/* Commission setter */}
          <div
            style={{
              background: "rgba(218,124,54,0.08)",
              border: "1px solid rgba(218,124,54,0.2)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fc9759", marginBottom: 12 }}>
              Set Commission Rate
            </div>
            <div className='flex gap-3 items-center'>
              <input
                className={styles["input"]}
                type='number'
                value={comm}
                onChange={e => setComm(Number(e.target.value))}
                style={{ maxWidth: 90 }}
                min={0}
                max={100}
              />
              <span style={{ color: "#7a9cc4" }}>%</span>
              <button
                className={`${styles["btn"]} ${styles["btnPrimary"]}`}
                style={{ marginLeft: "auto" }}
              >
                Update
              </button>
            </div>
          </div>
          {/* Financial */}
          <div
            style={{
              background: "#0d1f3c",
              border: "1px solid #1a3158",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}
          >
            {[
              ["Total Revenue", `$${panel.revenue.toLocaleString()}`],
              ["Platform Commission", `${panel.commission}%`],
              [
                "Instructor Earnings",
                `$${Math.round(panel.revenue * (1 - panel.commission / 100)).toLocaleString()}`,
              ],
              ["Pending Payout", `$${panel.pending.toLocaleString()}`],
            ].map(([k, v]) => (
              <div
                key={k}
                className='flex justify-between'
                style={{ padding: "8px 0", borderBottom: "1px solid #1a3158" }}
              >
                <span className={styles["metricLabel"]}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#e8f0fe" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            {panel.status === "Pending" ? (
              <>
                <button className={`${styles["btn"]} ${styles["btnSuccess"]} justify-center`}>
                  ✓ Approve
                </button>
                <button className={`${styles["btn"]} ${styles["btnDanger"]} justify-center`}>
                  ✗ Reject
                </button>
              </>
            ) : (
              <>
                <button className={`${styles["btn"]} ${styles["btnDanger"]} justify-center`}>
                  Suspend
                </button>
                <button className={`${styles["btn"]} ${styles["btnGhost"]} justify-center`}>
                  Assign Badge
                </button>
              </>
            )}
          </div>
          <button
            className={`${styles["btn"]} ${styles["btnSuccess"]}`}
            style={{ width: "100%", justifyContent: "center" }}
          >
            <DollarSign
              size={13}
              color='#00e5a0'
            />
            Manual Payout
          </button>
        </SlidePanel>
      )}
    </div>
  );
}
