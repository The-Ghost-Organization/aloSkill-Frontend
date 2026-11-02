export type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrls: string[];
  proposedPrice: string | number;
  approvedPrice: string | number | null;
  weight: number;
  stock: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  reviewNote: string | null;
  relatedCourseId?: string | null;
  relatedBookId?: string | null;
  commissionRate?: string | null;
  owner?: { email: string; instructorProfile: { displayName: string } | null };
  receipts?: {
    id: string;
    receivedQuantity: number;
    damagedQuantity: number;
    note: string | null;
    createdAt: string;
  }[];
};
export type ProductPage = { items: Product[]; total: number; page: number; pageSize: number };
export const productMoney = (value: string | number | null) =>
  value === null
    ? "Awaiting approval"
    : `৳${Number(value).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
