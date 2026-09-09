import {
  BookMarked, BookOpen, Briefcase,
  CheckCircle2, Clock, Cpu,
  Package, RotateCcw, XCircle,
} from "lucide-react";
import type { PaymentStatusConfig, ProductTypeConfig } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// SCALABLE PRODUCT TYPE REGISTRY
// Adding a new product type: add one entry here. Nothing else in the codebase
// needs to change — badges, filter pills, and invoice all derive from this.
// ─────────────────────────────────────────────────────────────────────────────
export const PRODUCT_TYPE_CONFIG: Record<string, ProductTypeConfig> = {
  COURSE: {
    label: "Course",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
    Icon: BookOpen,
  },
  EBOOK: {
    label: "eBook",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
    Icon: BookMarked,
  },
  PHYSICAL_BOOK: {
    label: "Physical Book",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
    Icon: Package,
  },
  DIGITAL_PRODUCT: {
    label: "Digital Product",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
    Icon: Cpu,
  },
  SERVICE: {
    label: "Service",
    color: "bg-pink-100 text-pink-700 border-pink-200",
    dotColor: "bg-pink-500",
    Icon: Briefcase,
  },
};

export const PAYMENT_STATUS_CONFIG: Record<string, PaymentStatusConfig> = {
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700",  Icon: CheckCircle2 },
  PENDING:   { label: "Pending",   color: "bg-yellow-100 text-yellow-700", Icon: Clock },
  FAILED:    { label: "Failed",    color: "bg-red-100 text-red-700",       Icon: XCircle },
  REFUNDED:  { label: "Refunded",  color: "bg-gray-100 text-gray-600",     Icon: RotateCcw },
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BKASH:  "bKash",
  NAGAD:  "Nagad",
  CARD:   "Visa/Mastercard",
  BANK:   "Bank Transfer",
  WALLET: "Wallet",
};

export const ITEMS_PER_PAGE = 5;