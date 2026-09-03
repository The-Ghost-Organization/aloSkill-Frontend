import { type PhysicalStatus } from "./Book";

const STATUS_CONFIG: Record<
  PhysicalStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  confirmed: {
    label: "Confirmed",
    dot: "bg-sky-500",
    text: "text-sky-700",
    bg: "bg-sky-50",
  },
  shipped: {
    label: "Shipped",
    dot: "bg-indigo-500",
    text: "text-indigo-700",
    bg: "bg-indigo-50",
  },
  out_for_delivery: {
    label: "Out for delivery",
    dot: "bg-orange-500",
    text: "text-orange-700",
    bg: "bg-orange-50",
  },
  delivered: {
    label: "Delivered",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
  },
  returned: {
    label: "Returned",
    dot: "bg-gray-500",
    text: "text-gray-700",
    bg: "bg-gray-100",
  },
};

export function BookStatusBadge({ status }: { status: PhysicalStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
