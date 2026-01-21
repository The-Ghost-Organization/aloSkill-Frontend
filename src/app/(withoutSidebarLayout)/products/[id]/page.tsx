// app/products/[id]/page.tsx

import ProductDetailsPage from "@/app/(withoutSidebarLayout)/products/ProductDetailsPage";
import { getAllBooks, getBookById } from "@/data/books";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Generate static params for all book IDs at build time
 * This enables Static Site Generation (SSG) for better performance
 *
 * @returns Array of params with book IDs
 */
export async function generateStaticParams() {
  const books = await getAllBooks();

  return books.map(book => ({
    id: book.id.toString(),
  }));
}

/**
 * Generate dynamic metadata for SEO optimization
 * Includes Open Graph and Twitter Card data
 *
 * @param params - Route parameters containing the book ID
 * @returns Metadata object for the page
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const book = await getBookById(parseInt(params.id));

  if (!book) {
    return {
      title: "Product Not Found | Your Bookstore",
      description: "The product you're looking for could not be found.",
    };
  }

  const price = book.originalPrice
    ? `৳${book.price.toFixed(2)} (${book.discount}% OFF)`
    : `৳${book.price.toFixed(2)}`;

  return {
    title: `${book.title} by ${book.author} | Your Bookstore`,
    description: book.description
      ? book.description.substring(0, 160) + "..."
      : `Buy ${book.title} by ${book.author} at ${price}. ${book.category} book with ${book.rating} star rating from ${book.reviews} reviews.`,
    keywords: [
      book.title,
      book.author,
      book.category || "Books",
      book.brand || "Books",
      "Online Bookstore",
      "Buy Books Online",
    ],
    openGraph: {
      title: `${book.title} by ${book.author}`,
      description: book.description || `Buy ${book.title} by ${book.author} at the best price.`,
      images: [
        {
          url: book.image,
          width: 800,
          height: 600,
          alt: book.title,
        },
      ],
      type: "website",
      siteName: "Your Bookstore",
    },
    twitter: {
      card: "summary_large_image",
      title: `${book.title} by ${book.author}`,
      description: book.description || `Buy ${book.title} by ${book.author}`,
      images: [book.image],
    },
    alternates: {
      canonical: `/products/${book.id}`,
    },
  };
}

/**
 * Product Details Page Component
 * Server Component that fetches product data and renders the details page
 *
 * @param params - Route parameters containing the book ID
 * @returns ProductDetailsPage component or 404
 */
export default async function ProductPage({ params }: { params: { id: string } }) {
  // Parse the book ID from the URL parameter
  const bookId = parseInt(params.id);

  // Validate that the ID is a valid number
  if (isNaN(bookId)) {
    notFound();
  }

  // Fetch the book data
  const book = await getBookById(bookId);

  // If book not found, show custom 404 page
  if (!book) {
    notFound();
  }

  // Render the product details page with the book data
  return <ProductDetailsPage product={book} />;
}
