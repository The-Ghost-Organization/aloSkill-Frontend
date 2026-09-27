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
  date?: string;
  completed: boolean;
}

interface BaseBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  orderId: string;
  purchaseDate: string;
  price: number;
  currency?: string;
}

export interface EbookItem extends BaseBook {
  type: "ebook";
  format: EbookFormat;
  fileName?: string;
  fileSizeMb?: number;
  downloadUrl?: string;
  readUrl?: string;
}

export interface PhysicalBookItem extends BaseBook {
  type: "physical";
  status: PhysicalStatus;
  trackingId?: string;
  courier?: string;
  estimatedDelivery?: string;
  address?: string;
  timeline: TimelineStep[];
}

export type BookState = {
  orderItemId: string;
  createdAt: Date | string;
  orderId: string;
  orderStatus: string;
  shippingAddress: {
    id: string;
    city: string;
    fullName: string;
    addressLine: string;
    postalCode: string;
    country: string;
    phone: string;
    deliveryArea: string | null;
  } | null;
  book: {
    id: string | undefined;
    title: string | undefined;
    coverImage: string | undefined;
    format: string;
    price: number;
    author: string | undefined;
    ebookAccess?: {
      available: boolean;
      fileName: string | null;
    } | null;
  };
  delivery: {
    status: string;
    courierName: string | null;
    trackingNumber: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  } | null;
}[];

export type BookItem = EbookItem | PhysicalBookItem;
