export type BookType = "ebook" | "physical";

export type PhysicalStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type EbookFormat = "PDF" | "EPUB" | "MOBI";

export interface TimelineStep {
  label: string;
  date?: string; // ISO date, undefined if not reached yet
  completed: boolean;
}

interface BaseBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string; 
  orderId: string;
  purchaseDate: string; // ISO date
  price: number;
  currency?: string; // defaults to "৳"
}

export interface EbookItem extends BaseBook {
  type: "ebook";
  format: EbookFormat;
  fileSizeMb: number;
  downloadUrl: string;
}

export interface PhysicalBookItem extends BaseBook {
  type: "physical";
  status: PhysicalStatus;
  trackingId?: string;
  courier?: string;
  estimatedDelivery?: string; // ISO date
  address?: string;
  timeline: TimelineStep[];
}

export type BookItem = EbookItem | PhysicalBookItem;
