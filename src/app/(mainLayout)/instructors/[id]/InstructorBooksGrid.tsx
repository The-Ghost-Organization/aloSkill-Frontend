"use client";

import { useCallback, useEffect, useState } from "react";

import type { BookResponse } from "@/app/(withoutSidebarLayout)/books/Books.type";
import BookCard from "@/app/(withoutSidebarLayout)/books/components/BookCard";
import { useSessionContext } from "@/app/contexts/SessionContext";
import { bookDraftStorage } from "@/lib/storage/courseDraftStorage";

type CartItem = {
  bookId: string;
  format: "PHYSICAL" | "EBOOK";
  quantity: number;
};

export default function InstructorBooksGrid({ books }: { books: BookResponse }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { setCartUpdate } = useSessionContext();

  useEffect(() => {
    setCartItems(bookDraftStorage.get<CartItem[]>() || []);
  }, []);

  const addBookToCart = useCallback(
    (bookId: string, allFormats: string[], format: "PHYSICAL" | "EBOOK") => {
      let cartData = bookDraftStorage.get<CartItem[]>() || [];

      const hasPhysical = allFormats.includes("HARDCOVER");
      const hasEbook = allFormats.includes("E_BOOK");

      // Keep this identical to the main books purchase flow.
      // A physical purchase includes the complimentary eBook when available.
      if (format === "PHYSICAL" && hasPhysical && hasEbook) {
        const hasPhysicalInCart = cartData.some(
          item => item.bookId === bookId && item.format === "PHYSICAL"
        );
        const hasEbookInCart = cartData.some(
          item => item.bookId === bookId && item.format === "EBOOK"
        );

        if (!hasPhysicalInCart) {
          cartData.push({ bookId, format: "PHYSICAL", quantity: 1 });
        }

        if (!hasEbookInCart) {
          cartData.push({ bookId, format: "EBOOK", quantity: 1 });
        }
      } else if (format === "EBOOK") {
        // If the user switches this book to eBook-only, remove its physical copy.
        cartData = cartData.filter(
          item => !(item.bookId === bookId && item.format === "PHYSICAL")
        );

        const hasEbookInCart = cartData.some(
          item => item.bookId === bookId && item.format === "EBOOK"
        );

        if (!hasEbookInCart) {
          cartData.push({ bookId, format: "EBOOK", quantity: 1 });
        }
      } else {
        const alreadyInCart = cartData.some(
          item => item.bookId === bookId && item.format === format
        );

        if (!alreadyInCart) {
          cartData.push({ bookId, format, quantity: 1 });
        }
      }

      bookDraftStorage.save(cartData);
      setCartItems(cartData);
      setCartUpdate?.(previous => !previous);
    },
    [setCartUpdate]
  );

  const handleAddToCart = useCallback(
    (bookId: string, allFormats: string[], format?: "PHYSICAL" | "EBOOK") => {
      if (!format) return;
      addBookToCart(bookId, allFormats, format);
    },
    [addBookToCart]
  );

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
      {books.map((book, index) => (
        <BookCard
          key={book.id}
          book={book}
          index={index}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}
