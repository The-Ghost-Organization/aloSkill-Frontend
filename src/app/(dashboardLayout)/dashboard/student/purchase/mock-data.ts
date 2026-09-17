import type { Purchase } from "./types";

/**
 * Replace this with your actual data source, e.g.:
 *   const purchases = await prisma.order.findMany({ where: { userId: session.user.id } });
 */
export const mockPurchases: Purchase[] = [
  {
    id: "ORD-2025-001", transactionId: "TXN-BK-78234901",
    productTitle: "Next.js 15 Mastery Complete Bootcamp", productType: "COURSE",
    thumbnail: "https://placehold.co/80x60/3b82f6/ffffff?text=NJS",
    purchaseDate: "2025-10-24T10:30:00", paymentMethod: "BKASH", paymentStatus: "COMPLETED",
    quantity: 1, originalPrice: 3500, discountAmount: 1000, couponCode: "SAVE1000",
    discountType: "FIXED", vatAmount: 0, finalAmount: 2500,
  },
  {
    id: "ORD-2025-002", transactionId: "TXN-NG-56123700",
    productTitle: "React Design Patterns — Complete eBook", productType: "EBOOK",
    thumbnail: "https://placehold.co/80x60/7c3aed/ffffff?text=RDP",
    purchaseDate: "2025-10-18T14:15:00", paymentMethod: "NAGAD", paymentStatus: "COMPLETED",
    quantity: 1, originalPrice: 800, discountAmount: 160, couponCode: "EBOOK20",
    discountType: "PERCENTAGE", vatAmount: 0, finalAmount: 640,
  },
  {
    id: "ORD-2025-003", transactionId: "TXN-CRD-99123456",
    productTitle: "Clean Code: A Handbook of Agile Software", productType: "PHYSICAL_BOOK",
    thumbnail: "https://placehold.co/80x60/059669/ffffff?text=CC",
    purchaseDate: "2025-10-10T09:00:00", paymentMethod: "CARD", paymentStatus: "COMPLETED",
    quantity: 2, originalPrice: 600, discountAmount: 0, couponCode: null,
    discountType: null, vatAmount: 180, finalAmount: 1380,
  },
  {
    id: "ORD-2025-004", transactionId: "TXN-BK-33456789",
    productTitle: "UI Component Library — Pro Pack", productType: "DIGITAL_PRODUCT",
    thumbnail: "https://placehold.co/80x60/d97706/ffffff?text=UIC",
    purchaseDate: "2025-09-30T16:45:00", paymentMethod: "BKASH", paymentStatus: "PENDING",
    quantity: 1, originalPrice: 4500, discountAmount: 900, couponCode: "LAUNCH20",
    discountType: "PERCENTAGE", vatAmount: 0, finalAmount: 3600,
  },
  {
    id: "ORD-2025-005", transactionId: "TXN-BNK-11223344",
    productTitle: "1-on-1 Mentorship Session (3 Hours)", productType: "SERVICE",
    thumbnail: "https://placehold.co/80x60/ec4899/ffffff?text=MNT",
    purchaseDate: "2025-09-20T11:00:00", paymentMethod: "BANK", paymentStatus: "COMPLETED",
    quantity: 1, originalPrice: 5000, discountAmount: 500, couponCode: "MENTOR10",
    discountType: "PERCENTAGE", vatAmount: 0, finalAmount: 4500,
  },
  {
    id: "ORD-2025-006", transactionId: "TXN-BK-44556677",
    productTitle: "TypeScript Advanced Patterns & Architecture", productType: "COURSE",
    thumbnail: "https://placehold.co/80x60/3b82f6/ffffff?text=TS",
    purchaseDate: "2025-09-05T08:30:00", paymentMethod: "BKASH", paymentStatus: "REFUNDED",
    quantity: 1, originalPrice: 2800, discountAmount: 0, couponCode: null,
    discountType: null, vatAmount: 0, finalAmount: 2800,
  },
  {
    id: "ORD-2025-007", transactionId: "TXN-NG-77889900",
    productTitle: "Figma to Code: Design Systems Masterclass", productType: "COURSE",
    thumbnail: "https://placehold.co/80x60/3b82f6/ffffff?text=FIG",
    purchaseDate: "2025-08-15T13:20:00", paymentMethod: "NAGAD", paymentStatus: "COMPLETED",
    quantity: 1, originalPrice: 3200, discountAmount: 800, couponCode: "DESIGN25",
    discountType: "FIXED", vatAmount: 0, finalAmount: 2400,
  },
  {
    id: "ORD-2025-008", transactionId: "TXN-CRD-55443322",
    productTitle: "Node.js API Development eBook — 2nd Edition", productType: "EBOOK",
    thumbnail: "https://placehold.co/80x60/7c3aed/ffffff?text=NODE",
    purchaseDate: "2025-08-01T10:00:00", paymentMethod: "CARD", paymentStatus: "FAILED",
    quantity: 1, originalPrice: 600, discountAmount: 0, couponCode: null,
    discountType: null, vatAmount: 0, finalAmount: 600,
  },
  {
    id: "ORD-2025-009", transactionId: "TXN-BK-99001122",
    productTitle: "Notion Productivity Template Bundle", productType: "DIGITAL_PRODUCT",
    thumbnail: "https://placehold.co/80x60/d97706/ffffff?text=NOT",
    purchaseDate: "2025-07-22T15:10:00", paymentMethod: "BKASH", paymentStatus: "COMPLETED",
    quantity: 3, originalPrice: 250, discountAmount: 75, couponCode: "BUNDLE30",
    discountType: "PERCENTAGE", vatAmount: 0, finalAmount: 675,
  },
  {
    id: "ORD-2025-010", transactionId: "TXN-NG-33214455",
    productTitle: "System Design Interview Handbook", productType: "PHYSICAL_BOOK",
    thumbnail: "https://placehold.co/80x60/059669/ffffff?text=SSD",
    purchaseDate: "2025-07-10T09:45:00", paymentMethod: "NAGAD", paymentStatus: "COMPLETED",
    quantity: 1, originalPrice: 900, discountAmount: 0, couponCode: null,
    discountType: null, vatAmount: 135, finalAmount: 1035,
  },
];