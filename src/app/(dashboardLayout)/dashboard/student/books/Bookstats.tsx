import { BookOpen, Download, Truck } from "lucide-react";
import type { BookItem } from "./UserBook.type";

export function BookStats({ books }: { books: BookItem[] }) {
  const total = books.length;
  const ebooks = books.filter(b => b.type === "ebook").length;
  const inTransit = books.filter(
    b => b.type === "physical" && !["delivered", "cancelled", "returned"].includes(b.status)
  ).length;

  const cards = [
    {
      label: "Total Books",
      value: total,
      icon: BookOpen,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "eBooks Owned",
      value: ebooks,
      icon: Download,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      label: "Out for Delivery",
      value: inTransit,
      icon: Truck,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
      {cards.map(card => (
        <div
          key={card.label}
          className='flex items-center gap-3 rounded border border-gray-200 bg-white px-5 py-4'
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}>
            <card.icon className={`h-5 w-5 ${card.iconColor}`} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>{card.label}</p>
            <p className='text-lg font-semibold text-gray-900'>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
