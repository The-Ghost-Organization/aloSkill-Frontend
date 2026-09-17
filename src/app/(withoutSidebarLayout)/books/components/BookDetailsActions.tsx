"use client";

import {
  Check,
  CircleDollarSign,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type FormatType = "PHYSICAL" | "EBOOK";

interface BookDetailsActionsProps {
  bookId: string;
  bookTitle: string;
  formats: string[];
  stock: "in-stock" | "limited" | "out-of-stock";
  prices: {
    physical: {
      salePrice: number | null;
      regularPrice: number | null;
    };
    digital: {
      salePrice: number | null;
      regularPrice: number | null;
    };
  };
}

function getFormatType(format: string): FormatType {
  return format === "HARDCOVER" ? "PHYSICAL" : "EBOOK";
}

function formatPrice(price: number | null) {
  if (price === null) {
    return null;
  }

  return `৳${price.toLocaleString("en-BD")}`;
}

export default function BookDetailsActions({
  bookId,
  bookTitle,
  formats,
  stock,
  prices,
}: BookDetailsActionsProps) {
  const router = useRouter();

  const availableFormats = useMemo(() => {
    const result: FormatType[] = [];

    for (const format of formats) {
      const type = getFormatType(format);

      if (!result.includes(type)) {
        result.push(type);
      }
    }

    return result.filter(format => {
      if (format === "PHYSICAL") {
        return (
          prices.physical.salePrice !== null ||
          prices.physical.regularPrice !== null
        );
      }

      return (
        prices.digital.salePrice !== null ||
        prices.digital.regularPrice !== null
      );
    });
  }, [formats, prices]);

  const [selectedFormat, setSelectedFormat] = useState<FormatType | null>(
    availableFormats[0] ?? null
  );

  const selectedPrice =
    selectedFormat === "PHYSICAL"
      ? prices.physical.salePrice ?? prices.physical.regularPrice
      : prices.digital.salePrice ?? prices.digital.regularPrice;

  const isPhysicalOutOfStock =
    selectedFormat === "PHYSICAL" && stock === "out-of-stock";

  const isDisabled =
    !selectedFormat || selectedPrice === null || isPhysicalOutOfStock;

  const handleBuyNow = () => {
    if (isDisabled || !selectedFormat) {
      return;
    }

    router.push(
      `/checkout?bookId=${encodeURIComponent(
        bookId
      )}&format=${encodeURIComponent(selectedFormat)}`
    );
  };

  const handleAddToCart = () => {
    if (isDisabled || !selectedFormat) {
      return;
    }

    /*
     * IMPORTANT:
     * Your current BookCardActions receives `onAddToCart` from
     * BooksClient. Since that cart implementation was not included
     * in the uploaded files, I am not inventing its API here.
     *
     * Connect your existing cart function here.
     *
     * Example:
     *
     * addToCart(bookId, selectedFormat);
     */

    window.dispatchEvent(
      new CustomEvent("book:add-to-cart", {
        detail: {
          bookId,
          format: selectedFormat,
        },
      })
    );
  };

  if (availableFormats.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-red-100 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-700">
          This book is currently unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Format Selection */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-gray-900">
            Choose Format
          </h2>

          {selectedPrice !== null && (
            <span className="text-lg font-black text-gray-900">
              {formatPrice(selectedPrice)}
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {availableFormats.map(format => {
            const isSelected = selectedFormat === format;

            const price =
              format === "PHYSICAL"
                ? prices.physical.salePrice ??
                  prices.physical.regularPrice
                : prices.digital.salePrice ??
                  prices.digital.regularPrice;

            const isOutOfStock =
              format === "PHYSICAL" && stock === "out-of-stock";

            return (
              <button
                key={format}
                type="button"
                disabled={isOutOfStock}
                onClick={() => setSelectedFormat(format)}
                className={`relative rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-amber-500 bg-amber-50/60 ring-1 ring-amber-500"
                    : "border-gray-200 bg-white hover:border-gray-300"
                } ${
                  isOutOfStock
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                {isSelected && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-amber-100 text-amber-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {format === "PHYSICAL" ? (
                      <Truck className="h-5 w-5" />
                    ) : (
                      <CircleDollarSign className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-gray-900">
                      {format === "PHYSICAL"
                        ? "Hardcover"
                        : "E-Book"}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {format === "PHYSICAL"
                        ? "Physical copy"
                        : "Digital version"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="font-bold text-gray-900">
                    {formatPrice(price)}
                  </span>
                </div>

                {format === "PHYSICAL" && (
                  <p className="mt-2 text-[11px] font-medium text-emerald-600">
                    Includes FREE eBook
                  </p>
                )}

                {isOutOfStock && (
                  <p className="mt-2 text-[11px] font-semibold text-red-500">
                    Out of stock
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isDisabled}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isDisabled}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CircleDollarSign className="h-4 w-4" />
          Buy Now
        </button>
      </div>

      {/* Selected format information */}
      {selectedFormat && (
        <p className="mt-3 text-center text-xs text-gray-400">
          Selected:{" "}
          <span className="font-semibold text-gray-600">
            {selectedFormat === "PHYSICAL"
              ? "Hardcover"
              : "E-Book"}
          </span>
        </p>
      )}

      {/* Accessibility / unavailable message */}
      <p className="mt-4 text-center text-xs text-gray-400">
        {isDisabled
          ? "Please select an available format to continue."
          : `Ready to purchase "${bookTitle}".`}
      </p>
    </div>
  );
}