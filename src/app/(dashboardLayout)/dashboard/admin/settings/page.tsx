"use client";

import { Toggle, SectionHeader } from "../Components";
import styles from "../AdminDashboard.module.css";

const featureToggles: [string, boolean][] = [
  ["Maintenance Mode", false],
  ["User Registration", true],
  ["Course Reviews", true],
  ["Referral System", true],
  ["Flash Sales", true],
  ["Gamification", true],
  ["AI Features", false],
  ["Physical Books", true],
];

const settingSections = [
  {
    title: "💰 Commission & Revenue",
    fields: [
      { l: "Default Commission %", t: "number", v: "30" },
      { l: "Min Payout ($)", t: "number", v: "50" },
    ],
  },
  {
    title: "🌍 Currency & Tax",
    fields: [
      { l: "Default Currency", t: "select", v: ["USD", "EUR", "GBP", "BDT"] },
      { l: "Tax Rate %", t: "number", v: "0" },
    ],
  },
  {
    title: "💳 Payment Gateways",
    fields: [
      { l: "Stripe Secret Key", t: "password", v: "sk_live_..." },
      { l: "PayPal Client ID", t: "text", v: "AXxxxxx..." },
    ],
  },
  {
    title: "🔍 SEO & Meta",
    fields: [
      { l: "Site Title", t: "text", v: "AloSkill — Learn Skills Online" },
      { l: "Meta Description", t: "text", v: "Platform tagline..." },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className={styles['pageEnter']}>
      <SectionHeader title="Platform Settings" sub="Configure global platform behaviour and integrations" />
      <div className={`${styles['kpiGrid4']}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {settingSections.map((s) => (
          <div key={s.title} className={styles['card']} style={{ padding: 24 }}>
            <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 20 }}>{s.title}</div>
            {s.fields.map((f) => (
              <div key={f.l} style={{ marginBottom: 14 }}>
                <div className={styles['metricLabel']} style={{ marginBottom: 7 }}>{f.l}</div>
                {f.t === "select" ? (
                  <select className={styles['select']}>
                    {(f.v as string[]).map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className={styles['input']} type={f.t} placeholder={f.v as string} />
                )}
              </div>
            ))}
            <button className={`${styles['btn']} ${styles['btnPrimary']}`} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
              Save Changes
            </button>
          </div>
        ))}
      </div>

      <div className={styles['card']} style={{ padding: 24 }}>
        <div className={styles['syneFont']} style={{ fontWeight: 700, fontSize: 15, color: "#e8f0fe", marginBottom: 20 }}>⚙️ Feature Toggles</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {featureToggles.map(([l, on]) => (
            <div key={l} style={{ background: "#070f1e", border: "1px solid #1a3158", borderRadius: 10, padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: on ? "#e8f0fe" : "#3d5a80" }}>{l}</span>
              <Toggle on={on} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
