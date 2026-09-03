export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type OrderItem = {
  id: string;
  quantity: number;
  format: "PHYSICAL" | "DIGITAL";
  price: number;
  status: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  book?: { id?: string; title: string; author: string; coverImage: string } | null;
  course?: { id?: string; title: string; thumbnailUrl: string | null } | null;
};

export type StudentOrder = {
  id: string;
  totalAmount: number;
  shippingCost: number;
  totalWeight: number;
  currency: string;
  status: OrderStatus;
  provider: string | null;
  paymentMethod: "CASH_ON_DELIVERY" | "ONLINE_PAYMENT" | null;
  providerOrderId?: string | null;
  createdAt: string;
  updatedAt?: string;
  shippingAddress?: {
    fullName: string;
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    deliveryArea: "INSIDE_DHAKA" | "OUTSIDE_DHAKA" | null;
  } | null;
  orderItems: OrderItem[];
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: "Order placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  PAID: "Paid",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};
