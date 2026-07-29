"use client";

import { CircleDollarSign, ShoppingCart, Truck, X } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useState } from "react";

interface Props {
  bookId: string;
  bookTitle: string;
  isInCart?: boolean;
  onAddToCart?: (bookId: string, format?: "PHYSICAL" | "EBOOK") => void;
  format: string[];
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

export default function BookCardActions({
  bookId,
  bookTitle,
  isInCart,
  onAddToCart,
  format,
  prices,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"PHYSICAL" | "EBOOK">();
  const router = useRouter();

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCartClick = (e: React.MouseEvent) => {
    stop(e);
    setIsModalOpen(true);
  };

  const handleConfirmAdd = (e: React.MouseEvent) => {
    stop(e);
    onAddToCart?.(bookId, selectedFormat);
    setIsModalOpen(false);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    stop(e);
    setIsBuyModalOpen(true);
  };

  const handleConfirmBuy = (e: React.MouseEvent) => {
    stop(e);
    router.push(`/checkout?bookId=${bookId}&format=${selectedFormat}`);
    setIsBuyModalOpen(false);
  };

  return (
    <div className='flex items-center gap-2.5 relative'>
      <button
        onClick={handleCartClick}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-gray-700 shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95 ${isInCart ? "bg-amber-400 hover:bg-amber-500 text-white" : "bg-white hover:bg-gray-50 text-gray-700"}`}
        aria-label={`Add ${bookTitle} to cart`}
        title='add to cart'
      >
        <ShoppingCart className='w-4 h-4' />
      </button>

      <button
        onClick={handleBuyNow}
        className='w-10 h-10 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95'
        aria-label={`Buy ${bookTitle} now`}
        title='Buy Now'
      >
        <CircleDollarSign className='w-4 h-4' />
      </button>

      {/* ─── CHOOSE FORMAT MODAL ─── */}
      {isModalOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs pointer-events-auto'
          onClick={e => {
            stop(e);
            setIsModalOpen(false);
          }}
        >
          <div
            className='relative w-full max-w-sm bg-white rounded p-2 shadow-xl border border-gray-100 mx-4 text-left pointer-events-auto'
            onClick={stop}
          >
            {/* Close Button */}
            <button
              onClick={e => {
                stop(e);
                setIsModalOpen(false);
              }}
              className='absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors'
            >
              <X className='w-4 h-4' />
            </button>

            <h3 className='font-bold text-gray-900 text-base mb-0.5 pr-6'>Select Format</h3>
            <p className='text-xs text-gray-500 mb-4 line-clamp-1'>{bookTitle}</p>

            {/* Radio Group Selection */}
            <div className='space-y-2.5 mb-5'>
              {format.map((item, index) => {
                const formatName = item === "HARDCOVER" ? "PHYSICAL" : "EBOOK";
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-all ${
                      selectedFormat === formatName
                        ? "border-amber-500 bg-amber-50/20"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                    onClick={() => setSelectedFormat(formatName)}
                  >
                    <div className='flex items-center gap-2.5'>
                      <div className='flex items-center gap-2'>
                        <Truck className='w-4 h-4 text-gray-400 shrink-0' />
                        <div>
                          <span className='block font-semibold text-xs text-gray-800'>
                            {formatName === "PHYSICAL" ? "Hard Cover" : "E-Book"}
                          </span>
                          <span className='block text-xs text-orange'>
                            {formatName === "PHYSICAL"
                              ? prices.physical.salePrice || prices.physical.regularPrice
                              : prices.digital.salePrice || prices.digital.regularPrice}
                            &nbsp;tk
                          </span>
                          {formatName === "PHYSICAL" && (
                            <span className='block text-[9px] text-emerald-600 font-medium'>
                              Includes FREE eBook!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleConfirmAdd}
              disabled={!selectedFormat}
              className='w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded shadow-sm transition-colors text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {isBuyModalOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs pointer-events-auto'
          onClick={e => {
            stop(e);
            setIsBuyModalOpen(false);
          }}
        >
          <div
            className='relative w-full max-w-sm bg-white rounded p-2 shadow-xl border border-gray-100 mx-4 text-left pointer-events-auto'
            onClick={stop}
          >
            {/* Close Button */}
            <button
              onClick={e => {
                stop(e);
                setIsBuyModalOpen(false);
              }}
              className='absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors'
            >
              <X className='w-4 h-4' />
            </button>

            <h3 className='font-bold text-gray-900 text-base mb-0.5 pr-6'>Select Format</h3>
            <p className='text-xs text-gray-500 mb-4 line-clamp-1'>{bookTitle}</p>

            {/* Radio Group Selection */}
            <div className='space-y-2.5 mb-5'>
              {format.map((item, index) => {
                const formatName = item === "HARDCOVER" ? "PHYSICAL" : "EBOOK";
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-all ${
                      selectedFormat === formatName
                        ? "border-amber-500 bg-amber-50/20"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                    onClick={() => setSelectedFormat(formatName)}
                  >
                    <div className='flex items-center gap-2.5'>
                      <div className='flex items-center gap-2'>
                        <Truck className='w-4 h-4 text-gray-400 shrink-0' />
                        <div>
                          <span className='block font-semibold text-xs text-gray-800'>
                            {formatName === "PHYSICAL" ? "Hard Cover" : "E-Book"}
                          </span>
                          <span className='block text-xs text-orange'>
                            {formatName === "PHYSICAL"
                              ? prices.physical.salePrice || prices.physical.regularPrice
                              : prices.digital.salePrice || prices.digital.regularPrice}
                            &nbsp;tk
                          </span>
                          {formatName === "PHYSICAL" && (
                            <span className='block text-[9px] text-emerald-600 font-medium'>
                              Includes FREE eBook!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleConfirmBuy}
              disabled={!selectedFormat}
              className='w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded shadow-sm transition-colors text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
