"use client";

import { SectionHeader, Toggle } from "../Components";

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
    <div className='animate-[pageEnter_0.3s_ease-out]'>
      <SectionHeader
        title='Platform Settings'
        sub='Configure global platform behaviour and integrations'
      />

      {/* Settings Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-5'>
        {settingSections.map(s => (
          <div
            key={s.title}
            className='bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'
          >
            <div className="font-['Syne'] font-bold text-[15px] text-slate-100 mb-5">{s.title}</div>
            {s.fields.map(f => (
              <div
                key={f.l}
                className='mb-3.5'
              >
                <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-1.5'>
                  {f.l}
                </div>
                {f.t === "select" ? (
                  <div className='relative'>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-[13.5px] text-slate-100 font-['Outfit'] outline-none focus:border-orange-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2212%22_height=%228%22_viewBox=%220_0_12_8%22%3E%3Cpath_d=%22M1_1l5_5_5-5%22_stroke=%22%233d5a80%22_stroke-width=%221.5%22_fill=%22none%22_stroke-linecap=%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-9">
                      {(f.v as string[]).map(o => (
                        <option
                          key={o}
                          className='bg-slate-900'
                        >
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-[13.5px] text-slate-100 font-['Outfit'] outline-none transition-all placeholder:text-slate-600 focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10"
                    type={f.t}
                    placeholder={f.v as string}
                  />
                )}
              </div>
            ))}
            <button className="w-full mt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-linear-to-br from-orange-500 to-orange-700 text-white font-['Outfit'] font-semibold text-[13px] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-px transition-all cursor-pointer">
              Save Changes
            </button>
          </div>
        ))}
      </div>

      {/* Feature Toggles Card */}
      <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
        <div className="font-['Syne'] font-bold text-[15px] text-slate-100 mb-5">
          ⚙️ Feature Toggles
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3'>
          {featureToggles.map(([l, on]) => (
            <div
              key={l}
              className='bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex justify-between items-center'
            >
              <span
                className={`text-xs font-medium transition-colors ${on ? "text-slate-100" : "text-slate-500"}`}
              >
                {l}
              </span>
              <Toggle on={on} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
