"use client";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "../../../../lib/api/client";
import { courseDraftStorage } from "../../../../lib/storage/courseDraftStorage";
import { useSessionContext } from "../../../contexts/SessionContext";

type Courses = {
  id: string;
  category: string | undefined;
  discountPrice: number;
  title: string;
  originalPrice: number;
  thumbnailUrl: string | null;
}[];

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<string>("bkash");

  const [cartItems, setCartItems] = useState<Courses>([]);
  const [storedCartItems, setStoredCartItems] = useState<{ courseId: string; quantity: number }[]>(
    []
  );
  const router = useRouter();
  const { user } = useSessionContext();

  const params = useParams();
  const courseId = params["slug"]?.[0];

  const fetchCourseData = async (storedCart: { courseId: string; quantity: number }[]) => {
    const response = await apiClient.post<Courses>(
      "/course/get-cart-courses",
      storedCart.map(course => course.courseId)
    );
    if (!response.success) {
      setCartItems([]);
      return;
    }
    setCartItems(response.data || []);
  };

  useEffect(() => {
    if (courseId) {
      setStoredCartItems([{ courseId, quantity: 1 }]);
      fetchCourseData([{ courseId, quantity: 1 }]);
      return;
    }
    const storedCart = courseDraftStorage.get<{ courseId: string; quantity: number }[]>();
    if (!storedCart || storedCart.length === 0) {
      setCartItems([]);
      return;
    }
    setStoredCartItems(storedCart);

    fetchCourseData(storedCart);
  }, [courseId]);

  const createOrder = async () => {
    if (!user) return;
    const orderResponse = await apiClient.post<{ gatewayPageURL: string; orderId: string }>(
      "/order/create-payment",
      {
        courseIds: courseId ? [courseId] : storedCartItems.map(item => item.courseId),
        paymentMethod,
        user: user.id,
      }
    );
    if (!orderResponse.success) {
      alert("Failed to create order. Please try again.");
      return;
    }
    // console.log(orderResponse.data);
    if (orderResponse.data) {
      router.push(orderResponse.data.gatewayPageURL);
    }
    alert("Order created successfully! Proceeding to payment...");
  };

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.discountPrice ? item.discountPrice : item.originalPrice) *
        (storedCartItems.find(ci => ci.courseId === item.id)?.quantity || 1),
    0
  );

  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const removeItem = (id: string) => {
    setStoredCartItems(items => {
      const updatedItems = items.filter(item => item.courseId !== id);
      courseDraftStorage.save(updatedItems);
      return updatedItems;
    });
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const paymentMethods = [
    { id: "bkash", icon: "B", label: "Bkash" },
    { id: "nagad", icon: "N", label: "Nagad", bgColor: "bg-blue-100" },
    { id: "qcash", icon: "Q", label: "Qcash", bgColor: "bg-blue-200" },
    { id: "card", icon: "C", label: "Card", bgColor: "bg-gray-800 text-white" },
    { id: "others", icon: "O", label: "Others" },
  ];

  return (
    <div className='min-h-screen bg-linear-to-br from-orange-50 via-purple-50 to-blue-50'>
      {/* Header */}
      <header className='bg-white shadow-sm animate-slide-down'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-[#074079]'>CheckOut</h1>
            <p className='text-sm text-gray-500 mt-1'>Home / Checkout</p>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Section - Billing & Payment */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Payment Option */}
            <div
              className='bg-white rounded-xl shadow-md p-6 sm:p-8 animate-fade-in'
              style={{ animationDelay: "100ms" }}
            >
              <h2 className='text-lg font-bold text-[#074079] mb-6'>Payment Option</h2>
              {/* Payment Methods */}
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

              {/* Card Details */}
              {/* {formData.paymentMethod === "card" && (
                <div className='space-y-4 animate-fade-in-up'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Name on Card
                    </label>
                    <input
                      type='text'
                      name='cardName'
                      value={formData.cardName}
                      onChange={handleInputChange}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA7C36] focus:border-transparent transition-all duration-200'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Card Number
                    </label>
                    <input
                      type='text'
                      name='cardNumber'
                      placeholder='xxxx xxxx xxxx xxxx'
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      maxLength={19}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA7C36] focus:border-transparent transition-all duration-200'
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Expire Date
                      </label>
                      <input
                        type='text'
                        name='expiryDate'
                        placeholder='DD/YY'
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        maxLength={5}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA7C36] focus:border-transparent transition-all duration-200'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>CVC</label>
                      <input
                        type='text'
                        name='cvc'
                        placeholder='xxx'
                        value={formData.cvc}
                        onChange={handleInputChange}
                        maxLength={3}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA7C36] focus:border-transparent transition-all duration-200'
                      />
                    </div>
                  </div>
                </div>
              )} */}
            </div>

            {/* Additional Information */}
            {/* <div
              className='bg-white rounded-xl shadow-md p-6 sm:p-8 animate-fade-in'
              style={{ animationDelay: "200ms" }}
            >
              <h2 className='text-xl font-bold text-[#074079] mb-6'>Additional Information</h2>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Order Notes <span className='text-gray-400'>(Optional)</span>
                </label>
                <textarea
                  name='orderNotes'
                  rows={5}
                  placeholder='Notes about your order, e.g. special notes for delivery'
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA7C36] focus:border-transparent transition-all duration-200 resize-none'
                />
              </div>
            </div> */}
          </div>

          {/* Right Section - Order Summary */}
          <div className='lg:col-span-1'>
            <div
              className='bg-white rounded-xl shadow-lg p-6 sticky top-8 animate-fade-in'
              style={{ animationDelay: "300ms" }}
            >
              <h2 className='text-xl font-bold text-[#074079] mb-6'>Order Summary</h2>

              {/* Order Items */}
              <div className='space-y-4 mb-6'>
                {cartItems.map(item => (
                  <div
                    key={item.id}
                    className='flex gap-3 items-center hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200'
                  >
                    <Image
                      width={80}
                      height={80}
                      src={item.thumbnailUrl || ""}
                      alt='Course Thumbnail'
                      className='w-16 h-16 object-cover rounded-lg'
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm text-gray-800 line-clamp-2 mb-1'>{item.title}</p>
                      <p className='text-sm text-gray-600'>
                        {storedCartItems.find(ci => ci.courseId === item.id)?.quantity || 1} x
                        <span className='text-[#DA7C36] font-semibold'>
                          ${item.discountPrice ? item.discountPrice : item.originalPrice}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className='text-gray-400 hover:text-orange transition-colors duration-200 cursor-pointer'
                      aria-label='Remove item'
                    >
                      <X className='w-5 h-5' />
                    </button>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className='space-y-3 border-t border-gray-200 pt-4'>
                <div className='flex justify-between text-gray-700'>
                  <span>Sub-total</span>
                  <span className='font-semibold'>${subtotal}</span>
                </div>
                <div className='flex justify-between text-gray-700'>
                  <span>Shipping</span>
                  <span className='font-semibold text-green-600'>Free</span>
                </div>
                {/* <div className='flex justify-between text-gray-700'>
                  <span>Discount</span>
                  <span className='font-semibold'>$5</span>
                </div> */}
                <div className='flex justify-between text-gray-700'>
                  <span>Tax</span>
                  <span className='font-semibold'>${tax.toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-lg font-bold text-[#074079] pt-3 border-t border-gray-200'>
                  <span>Total</span>
                  <span className='text-[#DA7C36]'>${total.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Payment Options */}

              {/* Place Order Button */}
              <button
                onClick={createOrder}
                disabled={cartItems.length === 0}
                className='w-full mt-6 py-3 bg-linear-to-r from-[#DA7C36] to-[#d15100] text-white rounded-lg font-bold text-base hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              >
                PAY WITH {paymentMethod.toUpperCase()}
                <ArrowRight className='w-5 h-5' />
              </button>
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

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
