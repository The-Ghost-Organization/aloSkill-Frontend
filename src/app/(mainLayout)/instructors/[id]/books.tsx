import type { BookResponse } from "@/app/(withoutSidebarLayout)/books/Books.type";
import { config } from "@/config/env";
import { BookOpen } from "lucide-react";
import InstructorBooksGrid from "./InstructorBooksGrid.tsx";

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

  return <InstructorBooksGrid books={books} />;
}
