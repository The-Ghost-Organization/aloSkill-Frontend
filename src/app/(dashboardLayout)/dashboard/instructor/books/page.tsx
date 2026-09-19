import { BookOpen, CircleDollarSign, Package, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { getInstructorBooks } from "./action";

const statusStyle: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  DRAFT: "bg-slate-100 text-slate-600",
};

const money = (value: number) => `৳ ${Number(value || 0).toLocaleString("en-BD")}`;

export default async function InstructorBooksPage() {
  const data = await getInstructorBooks();

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl'>My Books</h1>
          <p className='mt-1.5 max-w-2xl text-sm leading-6 text-slate-500'>
            Upload books and follow their admin-review status before publication.
          </p>
        </div>
        <Link
          href='/dashboard/instructor/books/upload-books'
          className='inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600'
        >
          <Plus size={16} /> Upload Book
        </Link>
      </div>

      {!data ? (
        <div className='rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
          Books could not be loaded. Please refresh or sign in again.
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {[
              { label: "My Books", value: data.totalBooks, icon: BookOpen },
              { label: "Copies Sold", value: data.totalSold, icon: ShoppingBag },
              { label: "Physical Stock", value: data.totalStock, icon: Package },
              { label: "Revenue", value: money(data.totalRevenue), icon: CircleDollarSign },
            ].map(item => (
              <div key={item.label} className='flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600'>
                  <item.icon size={20} />
                </div>
                <div>
                  <p className='text-2xl font-bold tracking-tight text-slate-900'>{item.value}</p>
                  <p className='text-xs text-slate-500'>{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm'>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[760px] text-left text-sm'>
                <thead className='border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-[0.08em] text-slate-500'>
                  <tr>
                    <th className='px-4 py-3'>Book</th>
                    <th className='px-4 py-3'>Formats</th>
                    <th className='px-4 py-3'>Price</th>
                    <th className='px-4 py-3'>Stock</th>
                    <th className='px-4 py-3'>Sales</th>
                    <th className='px-4 py-3'>Status</th>
                    <th className='px-4 py-3 text-right'>Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {data.bookBreakdown.map(book => {
                    const price =
                      book.physicalSalePrice ??
                      book.physicalRegularPrice ??
                      book.digitalSalePrice ??
                      book.digitalRegularPrice ??
                      0;
                    return (
                      <tr key={book.id} className='transition hover:bg-orange-50/30'>
                        <td className='px-4 py-3'>
                          <p className='font-semibold text-slate-900'>{book.title}</p>
                          <p className='text-xs text-slate-500'>{book.author}</p>
                        </td>
                        <td className='px-4 py-3 text-slate-600'>
                          {book.formats
                            .map(format => (format === "E_BOOK" ? "E-Book" : "Hardcover"))
                            .join(", ")}
                        </td>
                        <td className='px-4 py-3 font-medium text-slate-700'>{money(price)}</td>
                        <td className='px-4 py-3 text-slate-600'>{book.stock}</td>
                        <td className='px-4 py-3 text-slate-600'>{book.orderItem.length}</td>
                        <td className='px-4 py-3'>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              statusStyle[book.status] ?? statusStyle.DRAFT
                            }`}
                          >
                            {book.status}
                          </span>
                        </td>
                        <td className='px-4 py-3 text-right'>
                          <Link
                            href={`/dashboard/instructor/books/upload-books?editBookid=${book.id}`}
                            className='rounded-lg px-2.5 py-1.5 font-semibold text-orange-600 transition hover:bg-orange-50 hover:text-orange-700'
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {!data.bookBreakdown.length && (
                    <tr>
                      <td colSpan={7} className='px-4 py-12 text-center text-slate-500'>
                        You have not uploaded a book yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className='text-xs text-slate-500'>
            Pending books are visible only to you and administrators. They appear in the public
            store only after an administrator approves them.
          </p>
        </>
      )}
    </div>
  );
}
