import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type InstructorBook = {
  id: string;
  title: string;
  slug?: string | null;
  coverImage?: string | null;
  coverImageUrl?: string | null;
  authorName?: string | null;
  price?: number | string | null;
  salePrice?: number | string | null;
};

const getBooks = async (instructorId: string): Promise<InstructorBook[]> => {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];

  try {
    const response = await fetch(`${apiUrl}/book/instructor/${instructorId}`, {
      next: { revalidate: 300, tags: [`instructor-books-${instructorId}`] },
    });
    if (!response.ok) return [];

    const result = (await response.json()) as {
      data?: InstructorBook[] | { books?: InstructorBook[] };
    };
    if (Array.isArray(result.data)) return result.data;
    return result.data?.books ?? [];
  } catch {
    return [];
  }
};

const formatPrice = (value: number | string | null | undefined) => {
  const price = Number(value);
  return Number.isFinite(price) ? `৳${price.toLocaleString("en-BD")}` : null;
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
        const cover = book.coverImageUrl || book.coverImage;
        const price = formatPrice(book.salePrice ?? book.price);
        return (
          <Link
            key={book.id}
            href={`/books/${book.slug || book.id}`}
            className='group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg'
          >
            <div className='relative aspect-[3/4] bg-gray-50'>
              {cover ? (
                <Image
                  src={cover}
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
              {book.authorName && <p className='mt-1 text-sm text-gray-500'>{book.authorName}</p>}
              {price && <p className='mt-3 font-bold text-[#DA7C36]'>{price}</p>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
