import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type InstructorBook = {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
  physicalRegularPrice: number | string | null;
  physicalSalePrice: number | string | null;
  digitalRegularPrice: number | string | null;
  digitalSalePrice: number | string | null;
  formats: string[];
  stock: number;
  publisher: string;
  createdAt: string;
  category: { name: string } | null;
};

const getBooks = async (instructorId: string): Promise<InstructorBook[]> => {
  const apiUrl = process.env["API_URL"] || process.env["NEXT_PUBLIC_API_URL"];
  if (!apiUrl) return [];

  try {
    const response = await fetch(`${apiUrl}/book/instructor/${instructorId}/books`, {
      next: { revalidate: 300, tags: [`instructor-books-${instructorId}`] },
    });

    if (!response.ok) return [];

    const result = (await response.json()) as { data?: InstructorBook[] };
    return Array.isArray(result.data) ? result.data : [];
  } catch {
    return [];
  }
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return null;
  const price = Number(value);
  return Number.isFinite(price) ? price : null;
};

const getDisplayPrice = (book: InstructorBook) => {
  const physicalPrice = toNumber(book.physicalSalePrice) ?? toNumber(book.physicalRegularPrice);
  const digitalPrice = toNumber(book.digitalSalePrice) ?? toNumber(book.digitalRegularPrice);
  const availablePrices = [physicalPrice, digitalPrice].filter(
    (price): price is number => price !== null
  );

  if (availablePrices.length === 0) return null;
  return `৳${Math.min(...availablePrices).toLocaleString("en-BD")}`;
};

export async function BooksTab({ instructorId }: { instructorId: string }) {
  const books = await getBooks(instructorId);

  if (books.length === 0) {
    return (
      <div className='py-12 text-center'>
        <BookOpen className='mx-auto mb-4 h-16 w-16 text-gray-300' />
        <h3 className='mb-2 text-xl font-semibold text-gray-700'>No Books Yet</h3>
        <p className='text-gray-500'>This instructor has not published any books yet.</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {books.map(book => {
        const price = getDisplayPrice(book);

        return (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className='group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg'
          >
            <div className='relative aspect-[3/4] bg-gray-50'>
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={`Cover of ${book.title}`}
                  fill
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                  className='object-contain p-3'
                />
              ) : (
                <div className='flex h-full items-center justify-center'>
                  <BookOpen className='h-16 w-16 text-gray-300' />
                </div>
              )}
            </div>

            <div className='p-4'>
              <h3 className='line-clamp-2 font-bold text-[#074079] group-hover:text-[#DA7C36]'>
                {book.title}
              </h3>
              <p className='mt-1 text-sm text-gray-500'>by {book.author}</p>

              <div className='mt-3 flex items-center justify-between gap-3'>
                {price ? <p className='font-bold text-[#DA7C36]'>{price}</p> : <span />}
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    book.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {book.stock > 0 ? "In stock" : "Digital / out of stock"}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
