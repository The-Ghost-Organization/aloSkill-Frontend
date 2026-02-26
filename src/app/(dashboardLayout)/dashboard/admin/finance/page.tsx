"use client";

import styles from "../AdminDashboard.module.css";
import { DollarSign, Flag, RefreshCw, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, CustomTooltip, KpiCard, SectionHeader } from "../Components";
import { monthlyRevenue, PAYOUTS, REFUNDS, TRANSACTIONS } from "../Data";

const typeV: Record<string, string> = { Enrollment: "green", Payout: "blue", Refund: "orange" };

export default function FinancialPage() {
  const [tab, setTab] = useState("overview");

  return (
    <div className={styles["pageEnter"]}>
      <SectionHeader
        title='Financial Management'
        sub='Revenue, payouts, refunds and transaction tracking'
      />
      <div
        className={`${styles["kpiGrid4"]}`}
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}
      >
        <KpiCard
          label='Total Revenue'
          value='$462,800'
          icon={
            <DollarSign
              size={19}
              color='#4a9eff'
            />
          }
          accentColor='#4a9eff'
        />
        <KpiCard
          label='This Month'
          value='$95,000'
          icon={
            <TrendingUp
              size={19}
              color='#00e5a0'
            />
          }
          accentColor='#00e5a0'
        />
        <KpiCard
          label='Platform Earnings'
          value='$138,840'
          icon={
            <Zap
              size={19}
              color='#da7c36'
            />
          }
          accentColor='#da7c36'
        />
        <KpiCard
          label='Pending Payouts'
          value='$3,500'
          icon={
            <RefreshCw
              size={19}
              color='#ff4757'
            />
          }
          accentColor='#ff4757'
        />
      </div>

      <div
        className={styles["tabNav"]}
        style={{ marginBottom: 20, width: "fit-content" }}
      >
        {["overview", "payouts", "refunds", "transactions"].map(t => (
          <button
            key={t}
            className={`${styles["tabItem"]} ${tab === t ? styles["tabItemActive"] : styles["tabItemInactive"]}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div
          className={styles["card"]}
          style={{ padding: 24 }}
        >
          <div
            className={styles["syneFont"]}
            style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 24 }}
          >
            Revenue vs Payouts vs Platform
          </div>
          <ResponsiveContainer
            width='100%'
            height={280}
          >
            <BarChart
              data={monthlyRevenue}
              barSize={18}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#1a3158'
              />
              <XAxis
                dataKey='m'
                tick={{ fontSize: 11, fill: "#3d5a80", fontFamily: "'DM Mono',monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#3d5a80", fontFamily: "'DM Mono',monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey='rev'
                fill='#4a9eff'
                radius={[4, 4, 0, 0]}
                name='Total Revenue'
              />
              <Bar
                dataKey='platform'
                fill='#da7c36'
                radius={[4, 4, 0, 0]}
                name='Platform Earnings'
              />
              <Bar
                dataKey='enr'
                fill='#1a3158'
                radius={[4, 4, 0, 0]}
                name='Enrollments'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === "payouts" && (
        <div className={styles["card"]}>
          <div
            className='flex justify-between items-center'
            style={{ padding: "18px 20px", borderBottom: "1px solid #1a3158" }}
          >
            <div
              className={styles["syneFont"]}
              style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe" }}
            >
              Payout Requests
            </div>
            <Badge variant='orange'>
              {PAYOUTS.filter(p => p.status === "Pending").length} Pending
            </Badge>
          </div>
          <table className={styles["table"]}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Instructor</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {PAYOUTS.map(p => (
                <tr key={p.id}>
                  <td
                    className={styles["monoText"]}
                    style={{ fontSize: 12, color: "#3d5a80" }}
                  >
                    {p.id}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.instructor}</td>
                  <td
                    className={styles["monoText"]}
                    style={{ color: "#00e5a0", fontWeight: 600 }}
                  >
                    ${p.amount.toLocaleString()}
                  </td>
                  <td style={{ color: "#7a9cc4", fontSize: 13 }}>{p.method}</td>
                  <td
                    className={styles["monoText"]}
                    style={{ color: "#3d5a80", fontSize: 12 }}
                  >
                    {p.date}
                  </td>
                  <td>
                    <Badge variant={p.status === "Pending" ? "orange" : "green"}>{p.status}</Badge>
                  </td>
                  <td>
                    {p.status === "Pending" && (
                      <div className='flex gap-2'>
                        <button
                          className={`${styles["btn"]} ${styles["btnSuccess"]}`}
                          style={{ padding: "5px 12px", fontSize: 12 }}
                        >
                          Approve
                        </button>
                        <button
                          className={`${styles["btn"]} ${styles["btnDanger"]}`}
                          style={{ padding: "5px 12px", fontSize: 12 }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "refunds" && (
        <div className={styles["card"]}>
          <div
            className='flex justify-between items-center'
            style={{ padding: "18px 20px", borderBottom: "1px solid #1a3158" }}
          >
            <div
              className={styles["syneFont"]}
              style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe" }}
            >
              Refund Requests
            </div>
            <Badge variant='red'>{REFUNDS.filter(r => r.flagged).length} Flagged</Badge>
          </div>
          <table className={styles["table"]}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {REFUNDS.map(r => (
                <tr
                  key={r.id}
                  style={{ background: r.flagged ? "rgba(255,71,87,0.04)" : undefined }}
                >
                  <td
                    className={styles["monoText"]}
                    style={{ fontSize: 12, color: "#3d5a80" }}
                  >
                    {r.flagged && (
                      <Flag
                        size={12}
                        color='#ff4757'
                        style={{ marginRight: 4, display: "inline" }}
                      />
                    )}
                    {r.id}
                  </td>
                  <td style={{ fontWeight: 600 }}>{r.student}</td>
                  <td style={{ color: "#7a9cc4", fontSize: 13 }}>{r.course}</td>
                  <td
                    className={styles["monoText"]}
                    style={{ color: "#ff4757", fontWeight: 600 }}
                  >
                    ${r.amount}
                  </td>
                  <td style={{ color: "#7a9cc4", fontSize: 13 }}>{r.reason}</td>
                  <td
                    className={styles["monoText"]}
                    style={{ color: "#3d5a80", fontSize: 12 }}
                  >
                    {r.date}
                  </td>
                  <td>
                    <div className='flex gap-2'>
                      <button
                        className={`${styles["btn"]} ${styles["btnSuccess"]}`}
                        style={{ padding: "5px 12px", fontSize: 12 }}
                      >
                        Approve
                      </button>
                      <button
                        className={`${styles["btn"]} ${styles["btnDanger"]}`}
                        style={{ padding: "5px 12px", fontSize: 12 }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "transactions" && (
        <div className={styles["card"]}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #1a3158" }}>
            <div
              className={styles["syneFont"]}
              style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe" }}
            >
              Transaction Log
            </div>
          </div>
          <table className={styles["table"]}>
            <thead>
              <tr>
                <th>TXN ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map(t => (
                <tr key={t.id}>
                  <td
                    className={styles["monoText"]}
                    style={{ fontSize: 12, color: "#3d5a80" }}
                  >
                    {t.id}
                  </td>
                  <td>
                    <Badge variant={typeV[t.type]}>{t.type}</Badge>
                  </td>
                  <td style={{ color: "#7a9cc4", fontSize: 13 }}>{t.desc}</td>
                  <td
                    className={styles["monoText"]}
                    style={{ fontWeight: 700, color: t.amount > 0 ? "#00e5a0" : "#ff4757" }}
                  >
                    {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toLocaleString()}
                  </td>
                  <td
                    className={styles["monoText"]}
                    style={{ color: "#3d5a80", fontSize: 12 }}
                  >
                    {t.date}
                  </td>
                  <td>
                    <Badge variant={t.status === "Success" ? "green" : "red"}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
