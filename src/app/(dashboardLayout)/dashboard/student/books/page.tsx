import Link from "next/link";
import DashboardState from "../components/DashboardState";
import { MyBooksView } from "./Mybooksview";
import type { BookItem, BookState, EbookFormat, PhysicalStatus } from "./UserBook.type";
import { getUserBookData } from "./userBookAction";

function physicalStatus(value: string): PhysicalStatus {
  const status = value.toLowerCase();
  if (status === "processing" || status === "paid") return "confirmed";
  if (status === "failed") return "cancelled";
  if (["pending", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"].includes(status)) return status as PhysicalStatus;
  return "pending";
}

function urlFor(entries: BookState[number]["downloadUrls"], action: "READ" | "DOWNLOAD") {
  const match = entries?.find(entry => typeof entry === "object" && entry.action === action);
  if (match && typeof match === "object") return match.url;
  const first = entries?.[0];
  if (typeof first === "string") return action === "DOWNLOAD" ? first : undefined;
  return action === "DOWNLOAD" ? first?.url : undefined;
}

function toBookItem(item: BookState[number]): BookItem {
  const format = item.book.format.toUpperCase();
  const common = {
    id: item.book.id ?? item.orderItemId,
    title: item.book.title ?? "Untitled book",
    author: item.book.author ?? "AloSkill author",
    coverUrl: item.book.coverImage || undefined,
    orderId: item.orderId,
    purchaseDate: new Date(item.createdAt).toISOString(),
    price: Number(item.book.price),
  };

  if (format !== "PHYSICAL") {
    const ebookFormat = (["PDF", "EPUB", "MOBI"].includes(format) ? format : "PDF") as EbookFormat;
    return {
      ...common,
      type: "ebook",
      format: ebookFormat,
      readUrl: item.book.readUrl ?? urlFor(item.downloadUrls, "READ"),
      downloadUrl: urlFor(item.downloadUrls, "DOWNLOAD"),
    };
  }

  const status = physicalStatus(item.delivery?.status ?? item.orderStatus);
  const completedOrder = ["confirmed", "shipped", "out_for_delivery", "delivered"].includes(status);
  const completedShip = ["shipped", "out_for_delivery", "delivered"].includes(status);
  return {
    ...common,
    type: "physical",
    status,
    trackingId: item.delivery?.trackingNumber ?? undefined,
    courier: item.delivery?.courierName ?? undefined,
    address: item.shippingAddress ? `${item.shippingAddress.city}, ${item.shippingAddress.country}` : undefined,
    timeline: [
      { label: "Order confirmed", completed: completedOrder, date: completedOrder ? common.purchaseDate : undefined },
      { label: "Shipped", completed: completedShip, date: item.delivery?.shippedAt ?? undefined },
      { label: "Out for delivery", completed: ["out_for_delivery", "delivered"].includes(status) },
      { label: "Delivered", completed: status === "delivered", date: item.delivery?.deliveredAt ?? undefined },
    ],
  };
}

export default async function BooksPage() {
  const result = await getUserBookData();
  if (result.error) {
    return <DashboardState kind='error' title='Your books could not be loaded' description={result.error} action={<Link href='/dashboard/student/books' className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white'>Try again</Link>} />;
  }
  return <MyBooksView books={result.data.map(toBookItem)} />;
}
