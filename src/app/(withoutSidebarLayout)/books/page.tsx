import { parseCatalogTab } from "@/components/products/catalog";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllBooks, getAllBooksCategory } from "./bookAction";
import type { BookResponse } from "./Books.type.ts";
import BooksClient from "./components/BooksClient";
import CatalogTabs from "./components/CatalogTabs";

type SearchParams = Promise<{ tab?: string | string[]; genre?: string | string[] }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const tab = parseCatalogTab((await searchParams).tab);
  return {
    title: tab === "products" ? "Products — Books & Resources" : "All Books — Books & Resources",
    description:
      "Browse Aloskill's books and instructor-created learning products — stationery, course kits and tools.",
    alternates: { canonical: tab === "products" ? "/books?tab=products" : "/books" },
  };
}

export default async function BooksPage({ searchParams }: { searchParams: SearchParams }) {
  const { genre } = await searchParams;
  const [books, booksCategories] = await Promise.all([getAllBooks(), getAllBooksCategory()]);
  const bookList = (books ?? []) as BookResponse;
  const initialGenre = Array.isArray(genre) ? genre[0] : genre;

  return (
    <div className='min-h-screen bg-white'>
      {/* ── Static header — server-rendered, zero JS, good for SEO ── */}
      <div className='border-b border-gray-100'>
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14'>
          <p className='mb-2 text-xs font-bold uppercase tracking-[0.22em] text-orange'>
            Our Collection
          </p>
          <h1 className='text-3xl font-black leading-none text-navy-deep sm:text-4xl lg:text-5xl'>
            Books &amp; Resources
          </h1>
          <p className='mt-2 text-sm text-gray-400'>
            Curated books and instructor-made learning tools, sold and shipped by Aloskill.
          </p>
        </div>
      </div>

      {/* useSearchParams in CatalogTabs requires a Suspense boundary. */}
      <Suspense fallback={null}>
        <CatalogTabs
          bookCount={bookList.length}
          booksPanel={
            <BooksClient
              initialBooks={bookList}
              booksCategories={(booksCategories ?? []) as { id: string; name: string }[]}
              initialGenre={initialGenre}
            />
          }
        />
      </Suspense>
    </div>
  );
}
