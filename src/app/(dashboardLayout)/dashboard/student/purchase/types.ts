import type { ElementType } from "react";

// ── Domain literals ────────────────────────────────────────────────────────
// `(string & {})` keeps autocomplete for known values while allowing future
// extension without a breaking change to the union.
export type DiscountType = "PERCENTAGE" | "FIXED";
export type SortOrder   = "newest" | "oldest";

export type ProductTypeKey =
  | "COURSE" | "EBOOK" | "PHYSICAL_BOOK" | "DIGITAL_PRODUCT" | "SERVICE"
  | (string & {});

export type PaymentStatusKey =
  | "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED"
  | (string & {});

export type PaymentMethodKey =
  | "BKASH" | "NAGAD" | "CARD" | "BANK" | "WALLET"
  | (string & {});

// ── Core entity ────────────────────────────────────────────────────────────
export interface Purchase {
  id: string;
  transactionId: string;
  productTitle: string;
  productType: ProductTypeKey;
  thumbnail: string;
  purchaseDate: string;        // ISO-8601 string from the DB
  paymentMethod: PaymentMethodKey;
  paymentStatus: PaymentStatusKey;
  quantity: number;
  originalPrice: number;       // unit price (before discount)
  discountAmount: number;      // total discount in ৳
  couponCode: string | null;
  discountType: DiscountType | null;
  vatAmount: number;
  finalAmount: number;         // what the user actually paid
}

// ── Config shapes ──────────────────────────────────────────────────────────
export interface ProductTypeConfig {
  label: string;
  color: string;    // Tailwind badge classes
  dotColor: string; // Tailwind dot colour class
  Icon: ElementType;
}

export interface PaymentStatusConfig {
  label: string;
  color: string;
  Icon: ElementType;
}

// ── Derived / UI ───────────────────────────────────────────────────────────
export interface SummaryStats {
  totalOrders: number;
  totalSpent: number;
  totalSaved: number;
}