"use client";

import React from "react";

// ═══════════════════════════════════════════════════════
//   AVATAR
// ═══════════════════════════════════════════════════════
export function Avatar({
  name,
  size = 36,
  gradient = "to-br from-[#074079] to-[#da7c36]",
}: {
  name: string;
  size?: number;
  gradient?: string;
}) {
  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`
        rounded-[10px] flex items-center justify-center font-bold text-white shrink-0
        font-(family-name:--font-syne) bg-linear-${gradient}
      `}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//   BADGE
// ═══════════════════════════════════════════════════════
const badgeVariants: Record<string, string> = {
  green: "bg-green-500/10 text-green-500 border-green-500/20",
  red: "bg-red-500/10 text-red-500 border-red-500/20",
  orange: "bg-orange-500/12 text-orange-400 border-orange-500/25",
  blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  gold: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  gray: "bg-slate-500/8 text-slate-400 border-slate-500/15",
};

export function Badge({
  children,
  variant = "gray",
}: {
  children: React.ReactNode;
  variant?: string;
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11.5px] 
        font-semibold font-(family-name:--font-mono) border
        ${badgeVariants[variant] ?? badgeVariants["gray"]}
      `}
    >
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════
//   TOGGLE
// ═══════════════════════════════════════════════════════
export function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className={`
        w-10.5 h-5.75 rounded-full cursor-pointer relative transition-colors duration-200 shrink-0
        ${on ? "bg-(--color-accent)" : "bg-bg-navy-border"}
      `}
    >
      <div
        className={`
          w-4.25 h-4.25 rounded-full bg-white absolute top-[3px] 
          transition-all duration-200 shadow-md
          ${on ? "left-[22px]" : "left-[3px]"}
        `}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//   PROGRESS BAR
// ═══════════════════════════════════════════════════════
export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className='h-[5px] rounded-full overflow-hidden flex-1 bg-bg-navy-border'>
      <div
        className={`
          h-full rounded-full transition-all duration-600 ease-in-out
          ${!color ? "bg-linear-to-r from-[#074079] to-(--color-accent)" : ""}
        `}
        style={{
          width: `${value}%`,
          ...(color ? { backgroundColor: color } : {}),
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//   KPI CARD
// ═══════════════════════════════════════════════════════
export function KpiCard({
  label,
  value,
  sub,
  icon,
  accentColor = "var(--color-accent)",
  trend,
  trendUp,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accentColor?: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div
      className='
      relative overflow-hidden rounded-2xl p-5.5 cursor-default
      bg-navy border border-navy-border
      transition-all duration-250
      hover:-translate-y-0.5 hover:shadow-2xl hover:border-navy-hover
    '
    >
      <div
        className='absolute bottom-0 left-0 right-0 h-0.5 opacity-40 transition-opacity'
        style={{ background: accentColor }}
      />

      <div className='flex justify-between items-start mb-4'>
        <div
          className='w-10.5 h-10.5 rounded-xl flex items-center justify-center'
          style={{ background: `color-mix(in srgb, ${accentColor} 10%, transparent)` }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11.5px] 
            font-semibold font-(family-name:--font-mono) border
            ${
              trendUp
                ? "bg-green-500/10 text-(--color-green) border-green-500/20"
                : "bg-red-500/10 text-(--color-red) border-red-500/20"
            }
          `}
          >
            {trend}
          </span>
        )}
      </div>

      <div className='text-[26px] font-bold mb-0.5 text-(--color-text)'>{value}</div>
      <div className='text-[11px] uppercase tracking-wider text-(--color-muted) font-(family-name:--font-mono)'>
        {label}
      </div>
      {sub && <div className='text-xs mt-1.5 text-(--color-muted)'>{sub}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//   SECTION HEADER
// ═══════════════════════════════════════════════════════
export function SectionHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className='flex justify-between items-start mb-6'>
      <div>
        <h1 className='text-[22px] font-extrabold tracking-tight text-slate-100'>{title}</h1>
        {sub && <div className='text-[13px] mt-1 text-(--color-muted)'>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//   CUSTOM CHART TOOLTIP
// ═══════════════════════════════════════════════════════
export function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className='bg-navy border border-navy-border rounded-xl px-3.5 py-2.5 shadow-xl'>
      <div className='text-[11px] uppercase tracking-wider mb-1.5 text-slate-500 font-(family-name:--font-mono)'>
        {label}
      </div>
      {payload.map((p, i) => (
        <div
          key={i}
          className='text-[13px] font-semibold'
          style={{ color: p.color }}
        >
          {p.name}:{" "}
          {typeof p.value === "number" && p.value > 999 ? `$${p.value.toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//   SLIDE PANEL
// ═══════════════════════════════════════════════════════
export function SlidePanel({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className='fixed inset-0 z-100 flex justify-end backdrop-blur-sm animate-in fade-in bg-slate-950/80'
      onClick={onClose}
    >
      <div
        className='w-full md:w-[480px] max-w-full h-screen overflow-y-auto bg-(--color-navy-deep) border-l border-navy-border animate-in slide-in-from-right duration-300'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex justify-between items-center px-6 py-5 border-b border-navy-border'>
          <div className='font-bold text-base text-(--color-text)'>{title}</div>
          <button
            onClick={onClose}
            className='flex bg-transparent border-0 cursor-pointer p-1 hover:bg-white/5 rounded-md transition-colors'
          >
            <svg
              viewBox='0 0 24 24'
              width={18}
              height={18}
              fill='var(--color-muted)'
            >
              <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
            </svg>
          </button>
        </div>
        <div className='p-6'>{children}</div>
      </div>
    </div>
  );
}
