"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { forwardRef, type ReactNode } from "react";

// Shared presentation primitives for the course creation form.
// Pure UI: no form state lives here. Class names deliberately stick to
// bg-white / bg-gray-* / text-gray-* / border-gray-* and translucent state
// tints so the ADMIN_COURSE_THEME overrides in page.tsx keep working.

export const cx = (...cls: (string | false | null | undefined)[]) => cls.filter(Boolean).join(" ");

export const inputBase =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60";
export const inputOk =
  "border-gray-200 hover:border-gray-300 focus:border-orange focus:ring-2 focus:ring-orange/20";
export const inputBad = "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-500/20";

export const inputClass = (hasError?: boolean, extra?: string) =>
  cx(inputBase, hasError ? inputBad : inputOk, extra);

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-500/10 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange disabled:cursor-not-allowed disabled:opacity-50";
export const iconBtn =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-500/10 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange disabled:cursor-not-allowed disabled:opacity-40";
export const iconBtnDanger =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-40";

// ── Section ────────────────────────────────────────────────────────────────
export const FormSection = ({
  title,
  description,
  aside,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cx("border-b border-gray-100 px-4 py-6 last:border-b-0 sm:px-8 sm:py-8", className)}>
    <div className='mb-5 flex flex-wrap items-start justify-between gap-3'>
      <div className='max-w-prose'>
        <h3 className='text-[15px] font-semibold text-gray-900'>{title}</h3>
        {description && <p className='mt-1 text-sm leading-relaxed text-gray-500'>{description}</p>}
      </div>
      {aside}
    </div>
    <div className='space-y-5'>{children}</div>
  </section>
);

// ── Field wrapper ──────────────────────────────────────────────────────────
export const Field = ({
  label,
  htmlFor,
  optional,
  hint,
  error,
  counter,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  counter?: { value: number; max?: number; min?: number };
  children: ReactNode;
  className?: string;
}) => {
  const over = counter?.max !== undefined && counter.value > counter.max;
  const under = counter?.min !== undefined && counter.value > 0 && counter.value < counter.min;
  return (
    <div className={className}>
      <div className='mb-1.5 flex items-baseline justify-between gap-3'>
        <label
          htmlFor={htmlFor}
          className='text-[13px] font-medium text-gray-800'
        >
          {label}
          {optional && <span className='ml-1.5 font-normal text-gray-400'>(optional)</span>}
        </label>
        {counter && (
          <span
            className={cx(
              "text-xs tabular-nums",
              over ? "text-red-600" : under ? "text-amber-600" : "text-gray-400"
            )}
            aria-live='polite'
          >
            {counter.value}
            {counter.max !== undefined ? `/${counter.max}` : " characters"}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p
          role='alert'
          className='mt-1.5 flex items-start gap-1.5 text-xs text-red-600'
        >
          <AlertCircle
            className='mt-px h-3.5 w-3.5 shrink-0'
            aria-hidden='true'
          />
          {error}
        </p>
      ) : (
        hint && <p className='mt-1.5 text-xs leading-relaxed text-gray-500'>{hint}</p>
      )}
    </div>
  );
};

// ── Text input / textarea with forwarded refs (for react-hook-form) ─────────
export const TextInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>(({ hasError, className, ...rest }, ref) => (
  <input
    ref={ref}
    className={inputClass(hasError, className)}
    aria-invalid={hasError || undefined}
    {...rest}
  />
));
TextInput.displayName = "TextInput";

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }
>(({ hasError, className, ...rest }, ref) => (
  <textarea
    ref={ref}
    className={inputClass(hasError, cx("resize-y leading-relaxed", className))}
    aria-invalid={hasError || undefined}
    {...rest}
  />
));
TextArea.displayName = "TextArea";

// ── Select with consistent chevron ─────────────────────────────────────────
export const SelectInput = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }
>(({ hasError, className, children, ...rest }, ref) => (
  <select
    ref={ref}
    className={inputClass(hasError, cx("cursor-pointer appearance-none pr-10", className))}
    aria-invalid={hasError || undefined}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 0.9rem center",
    }}
    {...rest}
  >
    {children}
  </select>
));
SelectInput.displayName = "SelectInput";

// ── Choice card (radio / checkbox styled as a card) ────────────────────────
// `input` must be an <input className='peer sr-only' ... /> so peer-checked works.
export const choiceCardClass =
  "choice-card flex h-full cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-3.5 transition-colors hover:border-gray-300 peer-checked:border-orange peer-checked:bg-orange-500/10 peer-checked:[&_.choice-dot]:border-orange peer-checked:[&_.choice-dot]:bg-orange peer-focus-visible:ring-2 peer-focus-visible:ring-orange peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50";

export const ChoiceDot = () => (
  <span
    aria-hidden='true'
    className='choice-dot mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition-colors'
  >
    <span className='h-1.5 w-1.5 rounded-full bg-white' />
  </span>
);

// ── Segmented control item ────────────────────────────────────────────────
export const segmentClass =
  "segment flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 peer-checked:bg-white peer-checked:text-gray-900 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-orange";

// ── Callouts ──────────────────────────────────────────────────────────────
export const Callout = ({
  tone = "info",
  title,
  children,
  className,
  role,
}: {
  tone?: "info" | "warning" | "error" | "success";
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  role?: "alert" | "status";
}) => {
  const styles = {
    info: "border-gray-200 bg-gray-50 text-gray-700",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800",
  }[tone];
  const Icon = tone === "success" ? CheckCircle2 : tone === "info" ? Info : AlertCircle;
  return (
    <div
      role={role}
      className={cx("flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm", styles, className)}
    >
      <Icon
        className='mt-0.5 h-4 w-4 shrink-0 opacity-80'
        aria-hidden='true'
      />
      <div className='min-w-0 flex-1 leading-relaxed'>
        {title && <p className='font-semibold'>{title}</p>}
        {children && <div className={title ? "mt-1" : undefined}>{children}</div>}
      </div>
    </div>
  );
};

// ── Error summary (shown after a failed submit) ───────────────────────────
export const ErrorSummary = forwardRef<HTMLDivElement, { messages: string[]; title?: string }>(
  ({ messages, title = "Fix these before continuing" }, ref) => (
    <div
      ref={ref}
      tabIndex={-1}
      role='alert'
      className='mx-4 mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 outline-none focus-visible:ring-2 focus-visible:ring-red-400 sm:mx-8'
    >
      <p className='flex items-center gap-2 font-semibold'>
        <AlertCircle
          className='h-4 w-4'
          aria-hidden='true'
        />
        {title}
        <span className='rounded-full bg-red-500/15 px-2 py-0.5 text-xs tabular-nums'>{messages.length}</span>
      </p>
      <ul className='mt-2 space-y-1 pl-6 text-[13px] leading-relaxed'>
        {messages.map(message => (
          <li
            key={message}
            className='list-disc'
          >
            {message}
          </li>
        ))}
      </ul>
    </div>
  )
);
ErrorSummary.displayName = "ErrorSummary";

// ── Switch ───────────────────────────────────────────────────────────────
export const Switch = ({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id: string;
}) => (
  <div className='flex items-start justify-between gap-4'>
    <div>
      <label
        htmlFor={id}
        className='cursor-pointer text-[13px] font-medium text-gray-800'
      >
        {label}
      </label>
      {description && <p className='mt-0.5 text-xs text-gray-500'>{description}</p>}
    </div>
    <button
      id={id}
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2",
        checked ? "bg-orange" : "bg-gray-300"
      )}
    >
      <span
        aria-hidden='true'
        className={cx(
          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  </div>
);
