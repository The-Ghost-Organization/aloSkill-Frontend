"use client";

import { useCallback, useEffect, useState } from "react";

import type { BookResponse } from "@/app/(withoutSidebarLayout)/books/Books.type.ts";
import BookCard from "@/app/(withoutSidebarLayout)/books/components/BookCard.tsx";
import { bookDraftStorage } from "../../../../lib/storage/courseDraftStorage";
import { useSessionContext } from "../../../contexts/SessionContext";

type CartItem = {
  bookId: string;
  format: "PHYSICAL" | "EBOOK";
  quantity: number;
};

export default function AuthorBooksGrid({ books }: { books: BookResponse }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { setCartUpdate } = useSessionContext();

  const refreshCart = useCallback(() => {
    setCartItems(bookDraftStorage.get<CartItem[]>() || []);
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addBookToCart = useCallback(
    (bookId: string, allFormats: string[], format: "PHYSICAL" | "EBOOK") => {
      let cartData = bookDraftStorage.get<CartItem[]>() || [];

      const hasPhysical = allFormats.includes("HARDCOVER");
      const hasEbook = allFormats.includes("E_BOOK");

      // Keep the same cart behaviour as the main Books page:
      // buying the physical format also includes the complimentary eBook
      // when both formats are available.
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
        // Selecting only the eBook replaces a previous physical selection
        // for the same book, matching the current Books page behaviour.
        cartData = cartData.filter(item => !(item.bookId === bookId && item.format === "PHYSICAL"));

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
    <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5'>
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
