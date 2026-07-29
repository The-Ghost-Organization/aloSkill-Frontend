"use client";

import { useSessionContext } from "@/app/contexts/SessionContext.tsx";
import { apiClient } from "@/lib/api/client";
import { bookDraftStorage, checkoutDataStorage, courseDraftStorage } from "@/lib/storage/courseDraftStorage";
import { ArrowLeft, Minus, Plus, Tag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CartResponse = {
  books: {
    category: string | undefined;
    discountPrice: number;
    id: string;
    title: string;
    originalPrice: number;
    thumbnailUrl: string | null;
  }[];
  courses: {
    category: string | undefined;
    discountPrice: number;
    id: string;
    title: string;
    originalPrice: number;
    thumbnailUrl: string | null;
  }[];
};

type StoredItem = {
  courses: { courseId: string; quantity: number }[];
  books: { bookId: string; format: "PHYSICAL" | "EBOOK"; quantity: number }[];
};

export default function CartManager() {
  const [cartItems, setCartItems] = useState<CartResponse>({
    books: [],
    courses: [],
  });
  const [storedCartItems, setStoredCartItems] = useState<StoredItem>({
    courses: [],
    books: [],
  });
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const { setCartUpdate } = useSessionContext();

  useEffect(() => {
    const storedCart = courseDraftStorage.get<StoredItem["courses"]>();
    const bookCart = bookDraftStorage.get<StoredItem["books"]>();
    if ((!storedCart || storedCart.length === 0) && (!bookCart || bookCart.length === 0)) {
      setCartItems({ courses: [], books: [] });
      setIsLoading(false);
      return;
    }
    setStoredCartItems({
      courses: storedCart || [],
      books: bookCart || [],
    });

    const fetchFreshPrices = async () => {
      try {
        const payload: { courses?: string[]; books?: { bookId: string; format: string }[] } = {};

        if (storedCart && storedCart.length > 0) {
          payload.courses = storedCart.map(item => item.courseId);
        }

        if (bookCart && bookCart.length > 0) {
          payload.books = bookCart.map(item => ({ bookId: item.bookId, format: item.format }));
        }

        const response = await apiClient.post<CartResponse>("/cart/get-cart-items/", payload);

        if (response.success && response.data) {
          setCartItems(response.data);
        } else {
          setCartItems({ courses: [], books: [] });
        }
      } catch (error) {
        console.error("Failed to sync cart items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFreshPrices();
  }, []);

  const updateQuantity = (id: string, method: "plus" | "minus") => {
    const updated = storedCartItems.books.map(item => {
      if (item.bookId === id) {
        return {
          ...item,
          quantity: method === "plus" ? item.quantity + 1 : Math.max(1, item.quantity - 1),
        };
      }
      return item;
    });
    setStoredCartItems(prev => ({
      ...prev,
      books: updated,
    }));
    bookDraftStorage.save(updated);
  };

  const removeItem = (id: string) => {
    const updatedItems = storedCartItems.books.filter(item => item.bookId !== id);
    setStoredCartItems(prev => ({
      ...prev,
      books: updatedItems,
    }));
    bookDraftStorage.save(updatedItems);
    setCartItems(prev => ({
      ...prev,
      books: prev.books.filter(item => item.id !== id),
    }));
    setCartUpdate?.(prev => !prev);
  };

  const handleProceedToCheckout = async () => {
    setIsProcessing(true);
    try {
      checkoutDataStorage.save({
        items: cartItems,
        quantities: storedCartItems,
        subtotal,
      });

      router.push(`/checkout?isCart=true`);
    } catch (error) {
      console.error("Failed to save checkout data:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Computations
  // 1. Calculate Course Subtotal
  const courseSubtotal = cartItems.courses?.reduce((sum, item) => {
    const qty = storedCartItems.courses.find(ci => ci.courseId === item.id)?.quantity || 1;
    const price = item.discountPrice > 0 ? item.discountPrice : item.originalPrice;
    return sum + price * qty;
  }, 0);

  // 2. Calculate Book Subtotal
  const bookSubtotal = cartItems.books?.reduce((sum, item) => {
    const qty = storedCartItems.books.find(bi => bi.bookId === item.id)?.quantity || 1;
    const price = item.discountPrice > 0 ? item.discountPrice : item.originalPrice;
    return sum + price * qty;
  }, 0);

  // 3. Combined Subtotal
  const subtotal = courseSubtotal + bookSubtotal;

  // const tax = subtotal * 0.05;
  // const total = subtotal + tax;

  if (isLoading) {
    return (
      <div className='text-center py-12 text-gray-500 font-medium'>
        Updating cart items and prices...
      </div>
    );
  }

  if (cartItems.courses?.length === 0 && cartItems.books?.length === 0) {
    return (
      <div className='text-center py-16 bg-white rounded shadow-sm'>
        <h2 className='text-xl font-semibold text-gray-700 mb-4'>Your cart is empty</h2>
        <div className='flex flex-col sm:flex-row justify-center items-center gap-4'>
          <Link
            href='/courses'
            className='px-6 py-2 bg-[#DA7C36] text-white rounded font-medium inline-flex items-center gap-2'
          >
            <ArrowLeft className='w-4 h-4' /> Discover Courses
          </Link>
          <Link
            href='/books'
            className='px-6 py-2 bg-[#DA7C36] text-white rounded font-medium inline-flex items-center gap-2'
          >
            <ArrowLeft className='w-4 h-4' /> Discover Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold text-[#074079] mb-2'>
          Shopping Cart ({cartItems.courses?.length + cartItems.books?.length})
        </h2>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Products List Panel */}
        <div className='lg:col-span-2 space-y-4'>
          <div className='hidden md:grid md:grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm font-medium text-gray-600'>
            <div className='col-span-6'>PRODUCTS</div>
            <div className='col-span-2 text-center'>PRICE</div>
            <div className='col-span-2 text-center'>QUANTITY</div>
            <div className='col-span-2 text-center'>SUBTOTAL</div>
          </div>

          {cartItems.books?.map(item => {
            const currentQty =
              storedCartItems.books.find(ci => ci.bookId === item.id)?.quantity || 1;
            const activePrice = item.discountPrice > 0 ? item.discountPrice : item.originalPrice;

            // ─── Find selected format from local storage state ───
            const selectedFormat =
              storedCartItems.books.find(bi => bi.bookId === item.id)?.format || "EBOOK";

            return (
              <div
                key={item.id}
                className='bg-white rounded shadow-sm p-4'
              >
                <div className='grid grid-cols-1 md:grid-cols-12 gap-4 items-center'>
                  {/* Product Info */}
                  <div className='col-span-1 md:col-span-6 flex gap-4Item'>
                    <button
                      onClick={() => removeItem(item.id)}
                      className='text-gray-400 hover:text-red-500 transition-colors self-center'
                    >
                      <X className='w-5 h-5' />
                    </button>
                    <div className='flex items-center gap-3'>
                      {item.thumbnailUrl && (
                        <Image
                          width={80}
                          height={80}
                          src={encodeURI(item.thumbnailUrl)}
                          alt={item.title}
                          className='w-20 h-20 object-cover rounded shrink-0'
                        />
                      )}
                      <div className='space-y-1.5'>
                        <h3 className='text-base font-medium text-gray-700 line-clamp-2 leading-tight'>
                          {item.title}
                        </h3>

                        {/* ─── Physical / eBook Label Badge ─── */}
                        <div>
                          {selectedFormat === "PHYSICAL" ? (
                            <span className='inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 px-2 py-0.5 rounded'>
                              📖 Physical Book + eBook
                            </span>
                          ) : (
                            <span className='inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 px-2 py-0.5 rounded'>
                              📱 eBook Only
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className='col-span-1 md:col-span-2 flex md:justify-center items-center gap-2'>
                    <span className='md:hidden text-sm text-gray-600 font-medium'>Price:</span>
                    <div className='flex gap-2 items-center'>
                      {item.discountPrice > 0 ? (
                        <>
                          <span className='text-[#DA7C36] font-bold'>${item.discountPrice}</span>
                          <span className='text-gray-400 line-through text-xs'>
                            ${item.originalPrice}
                          </span>
                        </>
                      ) : (
                        <span className='text-[#DA7C36] font-bold'>${item.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className='col-span-1 md:col-span-2 flex md:justify-center items-center gap-2'>
                    <span className='md:hidden text-sm text-gray-600 font-medium'>Quantity:</span>
                    <div className='flex items-center gap-2 bg-gray-100 rounded p-1'>
                      <button
                        onClick={() => updateQuantity(item.id, "minus")}
                        className='w-7 h-7 flex items-center justify-center hover:bg-white rounded'
                      >
                        <Minus className='w-3 h-3 text-gray-600' />
                      </button>
                      <span className='w-6 text-center font-medium text-[#074079]'>
                        {currentQty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, "plus")}
                        className='w-7 h-7 flex items-center justify-center hover:bg-white rounded'
                      >
                        <Plus className='w-3 h-3 text-gray-600' />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal Item */}
                  <div className='col-span-1 md:col-span-2 flex md:justify-center items-center gap-2'>
                    <span className='md:hidden text-sm text-gray-600 font-medium'>Subtotal:</span>
                    <span className='text-[#074079] font-bold'>
                      ${(activePrice * currentQty).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {cartItems.courses?.map(item => {
            const currentQty =
              storedCartItems.courses.find(ci => ci.courseId === item.id)?.quantity || 1;
            const activePrice = item.discountPrice > 0 ? item.discountPrice : item.originalPrice;

            return (
              <div
                key={item.id}
                className='bg-white rounded shadow-sm p-4'
              >
                <div className='grid grid-cols-1 md:grid-cols-12 gap-4 items-center'>
                  {/* Product Info */}
                  <div className='col-span-1 md:col-span-6 flex gap-4Item'>
                    <button
                      onClick={() => removeItem(item.id)}
                      className='text-gray-400 hover:text-red-500 transition-colors self-center'
                    >
                      <X className='w-5 h-5' />
                    </button>
                    <div className='flex items-center gap-3'>
                      {item.thumbnailUrl && (
                        <Image
                          width={80}
                          height={80}
                          src={encodeURI(item.thumbnailUrl)}
                          alt={item.title}
                          className='w-20 h-20 object-cover rounded'
                        />
                      )}
                      <h3 className='text-base font-medium text-gray-700 line-clamp-2'>
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className='col-span-1 md:col-span-2 flex md:justify-center items-center gap-2'>
                    <span className='md:hidden text-sm text-gray-600 font-medium'>Price:</span>
                    <div className='flex gap-2 items-center'>
                      {item.discountPrice > 0 ? (
                        <>
                          <span className='text-[#DA7C36] font-bold'>${item.discountPrice}</span>
                          <span className='text-gray-400 line-through text-xs'>
                            ${item.originalPrice}
                          </span>
                        </>
                      ) : (
                        <span className='text-[#DA7C36] font-bold'>${item.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className='col-span-1 md:col-span-2 flex md:justify-center items-center gap-2'>
                    <span className='md:hidden text-sm text-gray-600 font-medium'>Quantity:</span>
                    <div className='flex items-center gap-2 bg-gray-100 rounded p-1'>
                      {/* <button
                        onClick={() => updateQuantity(item.id, "minus")}
                        className='w-7 h-7 flex items-center justify-center hover:bg-white rounded'
                      >
                        <Minus className='w-3 h-3 text-gray-600' />
                      </button> */}
                      <span className='w-6 text-center font-medium text-[#074079]'>
                        {currentQty}
                      </span>
                      {/* <button
                        onClick={() => updateQuantity(item.id, "plus")}
                        className='w-7 h-7 flex items-center justify-center hover:bg-white rounded'
                      >
                        <Plus className='w-3 h-3 text-gray-600' />
                      </button> */}
                    </div>
                  </div>

                  {/* Subtotal Item */}
                  <div className='col-span-1 md:col-span-2 flex md:justify-center items-center gap-2'>
                    <span className='md:hidden text-sm text-gray-600 font-medium'>Subtotal:</span>
                    <span className='text-[#074079] font-bold'>
                      ${(activePrice * currentQty).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <div className='flex gap-4 pt-4'>
            <Link
              href='/courses'
              className='flex-1 sm:flex-none'
            >
              <button className='w-full flex items-center justify-center gap-2 px-6 py-2 border-2 border-[#DA7C36] text-[#DA7C36] rounded hover:bg-[#DA7C36] hover:text-white transition-all font-medium'>
                <ArrowLeft className='w-4 h-4' /> RETURN TO SHOP
              </button>
            </Link>
          </div>
        </div>

        {/* Order Summary Panel */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded shadow-md p-6 sticky top-36 space-y-6'>
            <div className='space-y-3'>
              <label className='text-sm font-medium text-[#074079] flex items-center gap-2'>
                <Tag className='w-4 h-4' /> Apply coupon code
              </label>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder='Coupon code'
                  className='flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange'
                />
                <button className='px-4 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-medium'>
                  Apply
                </button>
              </div>
            </div>

            <div className='space-y-4 border-t border-gray-200 pt-4 text-sm'>
              <div className='flex justify-between text-gray-700'>
                <span>Subtotal</span>
                <span className='font-semibold'>${subtotal.toFixed(2)} BDT</span>
              </div>
              {/* <div className='flex justify-between text-gray-700'>
                <span>Tax (5%)</span>
                <span className='font-semibold'>${tax.toFixed(2)} USD</span>
              </div> */}
              {/* <div className='flex justify-between text-base font-bold text-[#074079] pt-4 border-t border-gray-200'>
                <span>Total</span>
                <span className='text-[#DA7C36]'>${subtotal.toFixed(2)} BDT</span>
              </div> */}
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={cartItems.courses.length === 0 && cartItems.books.length === 0}
              className={`w-full mt-4 py-2.5 bg-linear-to-r from-[#DA7C36] to-orange-dark text-white rounded font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md ${cartItems.courses.length === 0 && cartItems.books.length === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              {isProcessing ? "Securing Session..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
