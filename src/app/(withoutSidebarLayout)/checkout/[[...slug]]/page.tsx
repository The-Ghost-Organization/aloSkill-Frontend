"use client";
import { FadeIn } from "@/lib/course/utils.tsx";
import { ArrowRight, BaggageClaim, ChevronRight, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "../../../../lib/api/client";
import { useSessionContext } from "../../../contexts/SessionContext";
import { checkoutDataStorage } from '../../../../lib/storage/courseDraftStorage';

type OrderSummary = {
  items: {
    books: {
      id: string;
      title: string;
      category?: string;
      discountPrice?: number;
      originalPrice: number;
      thumbnailUrl?: string;
    }[];
    courses: {
      id: string;
      title: string;
      category?: string;
      discountPrice?: number;
      originalPrice: number;
      thumbnailUrl?: string;
    }[];
  };
  quantities: {
    courses: { courseId: string; quantity: number }[];
    books: { bookId: string; quantity: number; format: string }[];
  };
  subtotal: number;
};

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<string>("bkash");
  const router = useRouter();
  const { user } = useSessionContext();

  const searchParams = useSearchParams();
  const isCart = searchParams.get("isCart");
  const bookId = searchParams.get("bookId");
  const bookFormat = searchParams.get("format");
  const courseId = searchParams.get("courseId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    items: { books: [], courses: [] },
    quantities: { courses: [], books: [] },
    subtotal: 0,
  });

  // Delivery Form State
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    async function fetchOrderSummary() {
      if(isCart) {
        try {
          const storedCheckoutData = checkoutDataStorage.get<OrderSummary>();
          if (storedCheckoutData) {
            setOrderSummary(storedCheckoutData);
          }
        } catch (error) {
          console.error("Failed to retrieve checkout data from storage:", error);
        }
      }
    }
    fetchOrderSummary();
  }, [isCart]);

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setIsSubmitting(true);
      const checkoutPayload = {
        paymentMethod: paymentMethod,
        shippingDetails: hasPhysicalBook ? shippingDetails : null,
        orderSummary: orderSummary,
      };

      const response = await apiClient.post<{gatewayUrl:string}>("/order/create-order-with-UDDOKTAPAY", checkoutPayload);

      if (response.success) {
        if (response.data?.gatewayUrl) {
          window.location.href = response.data.gatewayUrl;
        } else {
          router.push("/checkout");
        }
      } else {
        console.error("Checkout failed:", response.errors);
      }
    } catch (error) {
      console.error("Error during checkout process:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetBooks = orderSummary?.quantities?.books || [];
  const hasPhysicalBook = targetBooks.some((book: any) => book.format === "PHYSICAL");

  // Validate form requirements
  const isFormValid =
    !hasPhysicalBook ||
    (shippingDetails.fullName.trim() !== "" &&
      shippingDetails.phoneNumber.trim() !== "" &&
      shippingDetails.addressLine.trim() !== "" &&
      shippingDetails.city.trim() !== "" &&
      shippingDetails.postalCode.trim() !== "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  const paymentMethods = [
    { id: "bkash", icon: "B", label: "Bkash" },
    { id: "nagad", icon: "N", label: "Nagad", bgColor: "bg-blue-100" },
    { id: "qcash", icon: "Q", label: "Qcash", bgColor: "bg-blue-200" },
    { id: "card", icon: "C", label: "Card", bgColor: "bg-gray-800 text-white" },
    { id: "others", icon: "O", label: "Others" },
  ];

  if (!orderSummary) {
    return <p className='text-center py-12'>Loading checkout information...</p>;
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-orange-50 via-purple-50 to-blue-50'>
      <header className='bg-white shadow-sm animate-slide-down'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex gap-3'>
            <BaggageClaim className='w-5 h-5 text-orange' />
            <FadeIn>
              <nav className='flex items-center gap-2 text-sm text-gray-600 overflow-x-auto'>
                <Link
                  href='/'
                  className='hover:text-orange transition-colors whitespace-nowrap'
                >
                  Home
                </Link>
                <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 shrink-0' />
                <p className='text-sm text-orange'>Checkout</p>
              </nav>
            </FadeIn>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <h2 className='text-xl font-semibold text-[#074079] mb-2'>Checkout</h2>
        <hr className='text-gray-300 py-4' />
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Section - Billing & Payment */}
          <div className='lg:col-span-2 space-y-6'>
            <div
              className='bg-white rounded-lg shadow-md p-6 sm:p-8 animate-fade-in'
              style={{ animationDelay: "50ms" }}
            >
              <h2 className='text-lg font-bold text-[#074079] mb-4'>Review Your Order</h2>
              <div className='divide-y divide-gray-100 max-h-100 overflow-y-auto pr-2'>
                {/* Loop Through Courses */}
                {orderSummary?.items.courses?.map((item: any) => (
                  <div
                    key={item.id}
                    className='flex gap-4 py-4 items-center justify-between group'
                  >
                    <div className='flex gap-4 items-center flex-1 min-w-0'>
                      <div className='relative w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden'>
                        <Image
                          fill
                          sizes='64px'
                          src={
                            item.thumbnailUrl
                              ? encodeURI(item.thumbnailUrl)
                              : "/placeholder-course.png"
                          }
                          alt={item.title}
                          className='object-cover'
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex gap-2 items-center mb-1'>
                          <span className='inline-block text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider'>
                            Course
                          </span>
                        </div>
                        <h3 className='text-sm font-medium text-gray-900 line-clamp-1'>
                          {item.title}
                        </h3>
                        <p className='text-xs text-gray-500 mt-0.5'>{item.category || "General"}</p>
                      </div>
                    </div>

                    <div className='text-center px-4 w-16 shrink-0'>
                      <span className='text-[10px] text-gray-400 block uppercase font-medium'>
                        Qty
                      </span>
                      <span className='text-sm font-semibold text-gray-700'>1</span>
                    </div>

                    <div className='text-right shrink-0 w-24'>
                      <p className='text-sm font-semibold text-[#DA7C36]'>
                        ${item.discountPrice ?? item.originalPrice}
                      </p>
                      {item.discountPrice && (
                        <p className='text-xs text-gray-400 line-through'>${item.originalPrice}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loop Through Books */}
                {orderSummary?.items.books?.map((item: any) => {
                  const currentQty =
                    orderSummary?.quantities.books.find(b => b.bookId === item.id)?.quantity || 1;
                  const bookFormat = orderSummary?.quantities.books.find(
                    b => b.bookId === item.id
                  )?.format;
                  return (
                    <div
                      key={item.id}
                      className='flex gap-4 py-4 items-center justify-between group'
                    >
                      <div className='flex gap-4 items-center flex-1 min-w-0'>
                        <div className='relative w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden'>
                          <Image
                            fill
                            sizes='64px'
                            src={
                              item.thumbnailUrl || item.coverImage
                                ? encodeURI(item.thumbnailUrl || item.coverImage)
                                : "/placeholder-book.png"
                            }
                            alt={item.title}
                            className='object-cover'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex gap-1.5 items-center mb-1 flex-wrap'>
                            <span className='inline-block text-[10px] bg-orange-50 text-[#DA7C36] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider'>
                              Book
                            </span>
                            {bookFormat !== "PHYSICAL" ? (
                              <span className='inline-block text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border border-teal-100'>
                                E-Book
                              </span>
                            ) : (
                              <span className='inline-block text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border border-purple-100'>
                                Physical Book
                              </span>
                            )}
                          </div>
                          <h3 className='text-sm font-medium text-gray-900 line-clamp-1'>
                            {item.title}
                          </h3>
                          <p className='text-xs text-gray-500 mt-0.5'>
                            {item.category || "Reading"}
                          </p>
                        </div>
                      </div>

                      <div className='text-center px-4 w-16 shrink-0'>
                        <span className='text-[10px] text-gray-400 block uppercase font-medium'>
                          Qty
                        </span>
                        <span className='text-sm font-bold text-[#074079]'>{currentQty}</span>
                      </div>

                      <div className='text-right shrink-0 w-24'>
                        <p className='text-sm font-semibold text-[#DA7C36]'>
                          ${item.discountPrice ?? item.salePrice ?? item.originalPrice}
                        </p>
                        {(item.discountPrice || item.salePrice) && (
                          <p className='text-xs text-gray-400 line-through'>
                            ${item.originalPrice ?? item.regularPrice}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Empty State Fallback */}
                {!orderSummary?.items.courses?.length && !orderSummary?.items.books?.length && (
                  <p className='text-sm text-gray-500 text-center py-6'>
                    No items found in your checkout selection.
                  </p>
                )}
              </div>
            </div>

            {/* DYNAMIC SHIPPNG FORM: Visible only when a physical book is in checkout */}
            {hasPhysicalBook && (
              <div
                className='bg-white rounded-lg shadow-md p-6 sm:p-8 border border-orange-100 animate-fade-in'
                style={{ animationDelay: "100ms" }}
              >
                <div className='flex items-center gap-2 mb-4 text-[#074079]'>
                  <Truck className='w-5 h-5 text-[#DA7C36]' />
                  <h2 className='text-lg font-bold'>Delivery Address</h2>
                </div>
                <p className='text-xs text-gray-500 mb-4 -mt-2'>
                  You have physical items in your order. Please complete your shipping destination
                  details.
                </p>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='sm:col-span-2'>
                    <label className='block text-xs font-semibold text-gray-700 mb-1'>
                      Full Name *
                    </label>
                    <input
                      type='text'
                      name='fullName'
                      required
                      value={shippingDetails.fullName}
                      onChange={handleInputChange}
                      placeholder='John Doe'
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-hidden focus:border-[#DA7C36] transition-colors'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-700 mb-1'>
                      Phone Number *
                    </label>
                    <input
                      type='tel'
                      name='phoneNumber'
                      required
                      value={shippingDetails.phoneNumber}
                      onChange={handleInputChange}
                      placeholder='+880 1234...'
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-hidden focus:border-[#DA7C36] transition-colors'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-700 mb-1'>City *</label>
                    <input
                      type='text'
                      name='city'
                      required
                      value={shippingDetails.city}
                      onChange={handleInputChange}
                      placeholder='Dhaka'
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-hidden focus:border-[#DA7C36] transition-colors'
                    />
                  </div>
                  <div className='sm:col-span-2'>
                    <label className='block text-xs font-semibold text-gray-700 mb-1'>
                      Street Address *
                    </label>
                    <input
                      type='text'
                      name='addressLine'
                      required
                      value={shippingDetails.addressLine}
                      onChange={handleInputChange}
                      placeholder='House 12, Road 4, Sector 3'
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-hidden focus:border-[#DA7C36] transition-colors'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-700 mb-1'>
                      Postal Code *
                    </label>
                    <input
                      type='text'
                      name='postalCode'
                      required
                      value={shippingDetails.postalCode}
                      onChange={handleInputChange}
                      placeholder='1230'
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-hidden focus:border-[#DA7C36] transition-colors'
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Options Wrapper */}
            <div
              className='bg-white rounded-lg shadow-md p-6 sm:p-8 animate-fade-in'
              style={{ animationDelay: "150ms" }}
            >
              <h2 className='text-lg font-bold text-[#074079] mb-6'>Payment Option</h2>
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4'>
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    type='button'
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-2 rounded border transition-all duration-300 flex flex-col items-center cursor-pointer hover:scale-105 ${
                      paymentMethod === method.id
                        ? "border-[#DA7C36] bg-orange-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`text-xl ${paymentMethod === method.id ? "scale-110" : ""} transition-transform duration-300`}
                    >
                      {method.icon}
                    </div>
                    <span className='text-xs text-center font-medium text-gray-700'>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary Breakdown */}
          <div className='lg:col-span-1'>
            <div
              className='bg-white rounded-lg shadow-lg p-6 sticky top-36 animate-fade-in'
              style={{ animationDelay: "300ms" }}
            >
              <h2 className='text-xl font-bold text-[#074079] mb-6'>Order Summary</h2>

              <div className='space-y-3 border-t border-gray-200 pt-4'>
                <div className='flex justify-between text-gray-700'>
                  <span>Sub-total</span>
                  <span className='font-semibold'>${orderSummary.subtotal || 0}</span>
                </div>
                <div className='flex justify-between text-gray-700'>
                  <span>Shipping</span>
                  <span className='font-semibold text-green-600'>Fr ee</span>
                </div>
                <div className='flex justify-between text-lg font-bold text-[#074079] pt-3 border-t border-gray-200'>
                  <span>Total</span>
                  <span className='text-[#DA7C36]'>${orderSummary.subtotal || 0} USD</span>
                </div>
              </div>

              {/* The checkout button is conditionally disabled if a physical book exists but inputs are missing */}
              <button
                disabled={!isFormValid || isSubmitting}
                onClick={handleCheckout}
                className='w-full mt-6 py-3 bg-linear-to-r from-[#DA7C36] to-orange-dark text-white rounded-lg font-bold text-base hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
              >
                {isSubmitting ? (
                  <span className='animate-pulse'>PROCESSING...</span>
                ) : !isFormValid ? (
                  "FILL SHIPPING DETAILS"
                ) : (
                  `PAY WITH ${paymentMethod.toUpperCase()}`
                )}
                {!isSubmitting && <ArrowRight className='w-5 h-5' />}
              </button>

              {!isFormValid && (
                <p className='text-[11px] text-red-500 text-center mt-2 font-medium'>
                  Delivery address details are required to buy physical books.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out both;
        }
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
