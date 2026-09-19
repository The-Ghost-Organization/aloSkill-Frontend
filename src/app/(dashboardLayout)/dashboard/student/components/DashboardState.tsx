import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

type DashboardStateProps = {
  kind: "loading" | "error" | "empty";
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

const defaults = {
  loading: { title: "Loading your dashboard", description: "Please wait while we get everything ready.", icon: Loader2 },
  error: { title: "Something went wrong", description: "We could not load this page. Please try again.", icon: AlertCircle },
  empty: { title: "Nothing here yet", description: "Your items will appear here when they are available.", icon: Inbox },
} satisfies Record<DashboardStateProps["kind"], { title: string; description: string; icon: LucideIcon }>;

export default function DashboardState({ kind, title, description, icon, action }: DashboardStateProps) {
  const fallback = defaults[kind];
  const Icon = icon ?? fallback.icon;

  return (
    <div role={kind === "error" ? "alert" : "status"} aria-live='polite' className='flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center'>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${kind === "error" ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-500"}`}>
        <Icon className={`h-6 w-6 ${kind === "loading" ? "animate-spin" : ""}`} />
      </div>
      <h2 className='mt-4 font-semibold text-gray-900'>{title ?? fallback.title}</h2>
      <p className='mt-1 max-w-md text-sm text-gray-500'>{description ?? fallback.description}</p>
      {action && <div className='mt-5'>{action}</div>}
    </div>
  );
}
