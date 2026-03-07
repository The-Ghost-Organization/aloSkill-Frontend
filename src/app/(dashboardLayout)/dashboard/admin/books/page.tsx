import { Plus } from "lucide-react";
import Link from "next/link";
import { Badge, SectionHeader } from "../Components";
import { BookActionButtonApprove, BookActionButtonView } from "./BookComponents";
import { getBookData } from "./action";

export default async function BooksPage() {
  const data = await getBookData();
  const bookData = data?.data;

  return (
    <div className='animate-slide-up'>
      <SectionHeader
        title='Books & Products'
        sub='Manage digital and physical book inventory'
        action={
          <Link href='/dashboard/admin/books/upload-books'>
            <button className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded bg-linear-to-br from-orange to-orange-dark text-white font-['Outfit'] font-semibold text-[13px] shadow shadow-orange-500/25 hover:shadow-orange-500/45 hover:-translate-y-px transition-all cursor-pointer border-none">
              <Plus
                size={14}
                color='white'
              />
              Add Book
            </button>
          </Link>
        }
      />

      {/* KPI Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6'>
        {[
          {
            l: "Total Books",
            v: bookData?.totalBooks,
            text: "text-blue-400",
            border: "after:bg-blue-400",
          },
          {
            l: "Digital Sales",
            v: bookData?.totalSold,
            text: "text-emerald-400",
            border: "after:bg-emerald-400",
          },
          {
            l: "Physical Stock",
            v: bookData?.totalStock,
            text: "text-orange-500",
            border: "after:bg-orange-500",
          },
          {
            l: "Total Revenue",
            v: bookData?.totalRevenue,
            text: "text-purple-400",
            border: "after:bg-purple-400",
          },
        ].map(s => (
          <div
            key={s.l}
            className={`group relative bg-slate-900 border border-slate-800 rounded p-3 pl-4 transition-all duration-250 hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/40 overflow-hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:opacity-40 hover:after:opacity-100 after:transition-opacity ${s.border}`}
          >
            <div className={`font-['Syne'] text-[22px] font-bold mb-1 ${s.text}`}>{s.v}</div>
            <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500'>
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className='border border-slate-800 rounded relative overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-b border-slate-800'>
                {[
                  "Sr.",
                  "Title",
                  "Author",
                  "Type",
                  "Price",
                  "Sales",
                  "Revenue",
                  "Stock",
                  "Status",
                  "Actions",
                ].map(h => (
                  <th
                    key={h}
                    className='bg-slate-900 text-slate-500 text-[11px] font-semibold uppercase tracking-widest p-3.5 px-4.5 text-left font-mono border-b border-slate-800'
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-800'>
              {bookData?.bookBreakdown.map((b, i) => (
                <tr
                  key={i + b.title.slice(0, 5)}
                  className='transition-colors hover:bg-slate-800/60'
                >
                  <td className='p-4 px-4.5 text-[13.5px] text-slate-100 font-semibold'>
                    {i + 1 + "."}
                  </td>
                  <td className='p-4 px-4.5 text-[13.5px] text-slate-100 font-semibold'>
                    {b.title.length > 20 ? b.title.slice(0, 20) + "..." : b.title}
                  </td>
                  <td className='p-4 px-4.5 text-[13.5px] text-slate-400'>{b.author}</td>
                  <td className='p-4 px-4.5 flex flex-col items-center gap-1'>
                    <Badge
                      fontSize='9'
                      variant={b.formats.includes("Hardcover") ? "blue" : "orange"}
                    >
                      {b.formats[0]}
                    </Badge>
                    {b.formats.length > 1 && (
                      <Badge
                        fontSize='9'
                        variant={b.formats.includes("Hardcover") ? "blue" : "orange"}
                      >
                        {b.formats[1]}
                      </Badge>
                    )}
                  </td>
                  <td className='p-4 px-4.5 text-[13.5px] text-slate-100 font-mono font-semibold'>
                    ${b.salePrice}
                  </td>
                  <td className='p-4 px-4.5 text-gray-200 font-mono text-xs!'>
                    {b.orderItem.length}
                  </td>
                  <td className='p-4 px-4.5 text-[13.5px] text-emerald-400 font-mono font-semibold'>
                    ${b.totalEarning}
                  </td>
                  <td
                    className={`p-4 px-4.5 text-[13.5px] font-mono ${
                      b.stock === null
                        ? "text-slate-600"
                        : b.stock < 20
                          ? "text-red-500"
                          : "text-slate-400"
                    }`}
                  >
                    {b.stock === null ? "∞" : b.stock}
                  </td>
                  <td className='p-4 px-4.5'>
                    <Badge variant={b.status === "APPROVED" ? "green" : "orange"}>{b.status}</Badge>
                  </td>
                  <td className='p-4 px-4.5'>
                    <div className='flex gap-2'>
                      <BookActionButtonView />
                      {b.status === "PENDING" && (
                        <BookActionButtonApprove
                          bookId={b.id}
                          bookData={bookData}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
