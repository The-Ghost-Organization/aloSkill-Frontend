import type { Metadata } from "next";

import { getAllBooks, getBookDetails } from "../bookAction";
import type { BookDetailsResponse } from "../Books.type";
import BookDetailsClient from "./BookDetailsClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Fetch a single book.
 *
 * Important:
 * Do not use generateStaticParams() here because your
 * book actions use authentication/session APIs internally.
 * generateStaticParams() runs outside a request scope.
 */
async function getBook(id: string): Promise<BookDetailsResponse | null> {
  const book = await getBookDetails(id);
  return book as BookDetailsResponse;
}

/**
 * SEO metadata
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const book = await getBook(id);

  return {
    title: `${book?.title} — ${book?.author}`,
    description: book?.description || `Buy ${book?.title} by ${book?.author} from AloSkill.`,
    openGraph: {
      title: `${book?.title} — ${book?.author}`,
      description: book?.description || `Buy ${book?.title} by ${book?.author} from AloSkill.`,
      images: book?.coverImage
        ? [
            {
              url: book.coverImage,
              alt: `Cover of ${book.title}`,
            },
          ]
        : undefined,
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;

  /*
   * Get the actual detailed book.
   */
  const book = (await getBook(id)) as BookDetailsResponse | null;
  if (!book) {
    return (
      <div>
        <p>Books not Found</p>
      </div>
    );
  }
  /*
   * Get books for the related-books section.
   *
   * This runs during the actual request, so it is safe even if
   * getAllBooks() internally uses getServerSession().
   */
  let relatedBooks: Awaited<ReturnType<typeof getAllBooks>> = [];

  try {
    const allBooks = await getAllBooks();

    if (Array.isArray(allBooks)) {
      relatedBooks = allBooks
        .filter(item => {
          if (item.id === book?.id) {
            return false;
          }

          if (!book?.category || !item.category) {
            return false;
          }

          return item.category.name === book.category.name;
        })
        .slice(0, 4);
    }
  } catch {
    /*
     * Related books are supplementary.
     *
     * If the related-books request fails, the actual book detail
     * page should still render.
     */
    relatedBooks = [];
  }

  return (
    <BookDetailsClient
      book={book}
      relatedBooks={relatedBooks}
    />
  );
}
