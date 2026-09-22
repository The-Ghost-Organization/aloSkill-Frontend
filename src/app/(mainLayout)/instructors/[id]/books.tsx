import type { BookResponse } from "@/app/(withoutSidebarLayout)/books/Books.type";
import BookCard from "@/app/(withoutSidebarLayout)/books/components/BookCard";
import { config } from "@/config/env";
import { BookOpen } from "lucide-react";

const getBooks = async (instructorId: string): Promise<BookResponse> => {
  try {
    const response = await fetch(
      `${config.NEXT_PUBLIC_BACKEND_API_URL}/book/instructor/${instructorId}/books`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch instructor books (${response.status}) for instructor ${instructorId}`
      );

      return [];
    }

    const result = (await response.json()) as {
      success?: boolean;
      data?: BookResponse;
      message?: string;
    };

    if (!result.success || !Array.isArray(result.data)) {
      console.error("Invalid instructor books response:", result);
      return [];
    }

    return result.data;
  } catch (error) {
    console.error("Failed to fetch instructor books:", error);
    return [];
  }
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
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
      {books.map((book, index) => (
        <BookCard
          key={book.id}
          book={book}
          index={index}
        />
      ))}
    </div>
  );
}
