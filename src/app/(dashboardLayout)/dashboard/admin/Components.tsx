"use client";
export function Avatar({
  name,
  size = 36,
  gradient = "135deg, #074079, #da7c36",
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
      className='rounded-[10px] flex items-center justify-center font-bold text-white shrink-0'
      style={{
        width: size,
        height: size,
        minWidth: size,
        fontSize: size * 0.35,
        fontFamily: "var(--font-syne)",
        background: `linear-gradient(${gradient})`,
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
  green:
    "bg-[color-mix(in_srgb,var(--color-green)_10%,transparent)]   text-(--color-green)         border border-[color-mix(in_srgb,var(--color-green)_20%,transparent)]",
  red: "bg-[color-mix(in_srgb,var(--color-red)_10%,transparent)]     text-(--color-red)           border border-[color-mix(in_srgb,var(--color-red)_20%,transparent)]",
  orange:
    "bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]  text-(--color-accent-light)  border border-[color-mix(in_srgb,var(--color-accent)_25%,transparent)]",
  blue: "bg-[color-mix(in_srgb,var(--color-blue)_10%,transparent)]    text-(--color-blue)          border border-[color-mix(in_srgb,var(--color-blue)_20%,transparent)]",
  gold: "bg-[color-mix(in_srgb,var(--color-gold)_10%,transparent)]    text-(--color-gold)          border border-[color-mix(in_srgb,var(--color-gold)_20%,transparent)]",
  purple:
    "bg-[color-mix(in_srgb,var(--color-purple)_10%,transparent)]  text-(--color-purple)        border border-[color-mix(in_srgb,var(--color-purple)_20%,transparent)]",
  gray: "bg-[color-mix(in_srgb,var(--color-soft)_8%,transparent)]     text-(--color-soft)          border border-[color-mix(in_srgb,var(--color-soft)_15%,transparent)]",
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
      className={`inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full text-[11.5px] font-semibold font-(family-name:--font-mono) ${
        badgeVariants[variant] ?? badgeVariants["gray"]
      }`}
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
      className='w-[42px] h-[23px] rounded-[12px] cursor-pointer relative transition-colors duration-200 border-0 shrink-0'
      style={{ background: on ? "var(--color-accent)" : "var(--color-navy-border)" }}
    >
      <div
        className='w-[17px] h-[17px] rounded-full bg-white absolute top-[3px] transition-[left] duration-200 shadow-[0_2px_6px_rgba(0,0,0,0.4)]'
        style={{ left: on ? 22 : 3 }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//   PROGRESS BAR
// ═══════════════════════════════════════════════════════
export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className='h-[5px] rounded-full overflow-hidden flex-1 bg-(--color-navy-border)'>
      <div
        className='h-full rounded-full transition-[width] duration-[600ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]'
        style={{
          width: `${value}%`,
          background: color ?? "linear-gradient(90deg, #074079, var(--color-accent))",
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
        relative overflow-hidden rounded-[16px] p-[22px] cursor-default
        bg-(--color-navy) border border-(--color-navy-border)
        transition-all duration-[250ms]
        hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]
        hover:border-(--color-navy-hover)
      '
    >
      {/* Replaces ::after pseudo-element accent bar */}
      <div
        className='absolute bottom-0 left-0 right-0 h-[2px] opacity-40 transition-opacity duration-[250ms]'
        style={{ background: accentColor }}
      />

      <div className='flex justify-between items-start mb-4'>
        <div
          className='w-[42px] h-[42px] rounded-[11px] flex items-center justify-center'
          style={{ background: `color-mix(in srgb, ${accentColor} 10%, transparent)` }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className='inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full text-[11.5px] font-semibold font-(family-name:--font-mono)'
            style={{
              background: trendUp ? "rgba(0,229,160,0.08)" : "rgba(255,71,87,0.08)",
              color: trendUp ? "var(--color-green)" : "var(--color-red)",
              border: `1px solid ${trendUp ? "rgba(0,229,160,0.2)" : "rgba(255,71,87,0.2)"}`,
            }}
          >
            {trend}
          </span>
        )}
      </div>

      <div className='text-[26px] font-bold mb-0.5 text-(--color-text) '>{value}</div>
      <div className='text-[11px] uppercase tracking-[1px] text-(--color-muted) font-(family-name:--font-mono)'>
        {label}
      </div>
      {sub && <div className='text-[12px] mt-1.5 text-(--color-muted)'>{sub}</div>}
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
        <h1 className='text-[22px] font-extrabold tracking-[-0.3px] text-navy-deep '>{title}</h1>
        {sub && <div className='text-[13px] mt-[3px] text-(--color-muted)'>{sub}</div>}
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
    <div className='bg-(--color-navy) border border-(--color-navy-border) rounded-[10px] px-[14px] py-[10px]'>
      <div className='text-[11px] uppercase tracking-[1px] mb-1.5 text-(--color-soft) font-(family-name:--font-mono)'>
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
      className='fixed inset-0 z-[100] flex justify-end backdrop-blur-[4px] animate-(--animate-fade-in) bg-[rgba(5,13,26,0.8)]'
      onClick={onClose}
    >
      <div
        className='w-full md:w-[480px] max-w-full h-screen overflow-y-auto bg-(--color-navy-deep) border-l border-(--color-navy-border) animate-(--animate-slide-in)'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex justify-between items-center px-6 py-5 border-b border-(--color-navy-border)'>
          <div className='font-bold text-[16px] text-(--color-text) '>{title}</div>
          <button
            onClick={onClose}
            className='flex bg-transparent border-0 cursor-pointer'
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
