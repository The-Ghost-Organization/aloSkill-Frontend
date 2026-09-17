"use client";
import { FadeIn } from "@/lib/course/utils.tsx";
import {
  ArrowRight,
  BaggageClaim,
  Banknote,
  ChevronRight,
  CreditCard,
  MapPin,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../../../lib/api/client";
import { checkoutDataStorage } from "../../../../lib/storage/courseDraftStorage";
import { useSessionContext } from "../../../contexts/SessionContext";

// NOTE: adjust these import paths to wherever your three JSON files actually live.
import districtsData from "@/lib/bd-division-district/districts.json";
import divisionsData from "@/lib/bd-division-district/divisions.json";
import upazilasData from "@/lib/bd-division-district/upazilas.json";

// Dhaka DISTRICT id (not the whole Dhaka division) — used to auto-decide
// "Inside Dhaka" vs "Outside Dhaka" courier pricing.
const DHAKA_DISTRICT_ID = "1";

type Division = { id: string; name: string; bn_name: string };
type District = { id: string; division_id: string; name: string; bn_name: string };
// Assumed shape — adjust the key name (e.g. to "districtId") if your upazilas.json differs.
type Upazila = { id: string; district_id: string; name: string; bn_name: string };

const divisions = divisionsData as Division[];
const districts = districtsData as District[];
const upazilas = upazilasData as Upazila[];

type OrderSummary = {
  items: {
    books: {
      id: string;
      title: string;
      thumbnailUrl: string;
      category: string | undefined;
      weight: number;
      physicalRegularPrice: number | null;
      physicalSalePrice: number | null;
      digitalRegularPrice: number | null;
      digitalSalePrice: number | null;
      hasDigital?: boolean;
      // Stock for the physical format. Rename this to match your API's actual field.
      stockQuantity?: number | null;
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

type StockIssue = {
  bookId: string;
  title: string;
  requested: number;
  available: number;
};

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "ONLINE_PAYMENT">(
    "ONLINE_PAYMENT"
  );
  const router = useRouter();
  const { user } = useSessionContext();

  const searchParams = useSearchParams();
  const isCart = searchParams.get("isCart");
  const bookId = searchParams.get("bookId");
  const format = searchParams.get("format");
  const courseId = searchParams.get("courseId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    items: { books: [], courses: [] },
    quantities: { courses: [], books: [] },
    subtotal: 0,
  });

  // Delivery Form State (location is now selected via division/district/upazila,
  // deliveryArea is DERIVED, not chosen manually — see `deliveryArea` below)
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine: "",
    postalCode: "",
    divisionId: "",
    districtId: "",
    upazilaId: "",
  });

  // Stock check state
  const [stockIssues, setStockIssues] = useState<StockIssue[]>([]);
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [stockCheckError, setStockCheckError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderSummary() {
      // 1. Cart Checkout
      if (isCart) {
        try {
          const storedCheckoutData = checkoutDataStorage.get<OrderSummary>();
          if (storedCheckoutData) {
            setOrderSummary(storedCheckoutData);
          }
        } catch (error) {
          console.error("Failed to retrieve checkout data from storage:", error);
        }
        return;
      }

      // 2. Direct Book Purchase
      if (bookId && format) {
        try {
          const response = await apiClient.get<OrderSummary["items"]["books"][0]>(
            `/book/user/checkout/${bookId}?format=${format}`
          );

          if (response.success && response.data) {
            const book = response.data;
            const isPhysical = format === "PHYSICAL";

            // Determine pricing based on selected format
            const itemPrice = isPhysical
              ? (book.physicalSalePrice ?? book.physicalRegularPrice ?? 0)
              : (book.digitalSalePrice ?? book.digitalRegularPrice ?? 0);

            // Build quantity entries: Include both formats if physical is chosen AND book has digital available
            const bookQuantities = [
              {
                bookId: book.id,
                quantity: 1,
                format: format as string,
              },
            ];

            if (isPhysical && book.hasDigital) {
              bookQuantities.push({
                bookId: book.id,
                quantity: 1,
                format: "EBOOK",
              });
            }

            setOrderSummary(prev => ({
              ...prev,
              items: {
                ...prev.items,
                books: [
                  {
                    ...book,
                    physicalRegularPrice: Number(book.physicalRegularPrice),
                    digitalRegularPrice: Number(book.digitalRegularPrice),
                    physicalSalePrice: Number(book.physicalSalePrice),
                    digitalSalePrice: Number(book.digitalSalePrice),
                    weight: Number(book.weight),
                    stockQuantity:
                      book.stockQuantity === undefined || book.stockQuantity === null
                        ? null
                        : Number(book.stockQuantity),
                  },
                ],
              },
              quantities: {
                ...prev.quantities,
                books: bookQuantities,
              },
              subtotal: Number(itemPrice),
            }));
          } else {
            console.error("Failed to fetch book order summary:", response.errors);
          }
        } catch (error) {
          console.error("Error fetching book order summary:", error);
        }
        return;
      }

      // 3. Direct Course Purchase
      if (courseId) {
        try {
          const response = await apiClient.get<OrderSummary>(`/course/user/checkout/${courseId}`);

          if (response.success && response.data) {
            setOrderSummary(response.data);
          } else {
            console.error("Failed to fetch course order summary:", response.errors);
          }
        } catch (error) {
          console.error("Error fetching course order summary:", error);
        }
      }
    }

    fetchOrderSummary();
  }, [isCart, bookId, format, courseId]);

  const targetBooks = orderSummary?.quantities?.books || [];
  const hasPhysicalBook = targetBooks.some((book: any) => book.format === "PHYSICAL");

  // ---- Stock verification ----
  // Re-checks live stock for every physical book in the order. Runs once the
  // order summary is loaded, and again right before final submission so a
  // book that sold out between page-load and checkout click still gets caught.
  async function verifyPhysicalStock(): Promise<StockIssue[]> {
    const physicalEntries = targetBooks.filter(b => b.format === "PHYSICAL");
    if (physicalEntries.length === 0) return [];

    setIsCheckingStock(true);
    setStockCheckError(null);
    try {
      const results = await Promise.all(
        physicalEntries.map(async entry => {
          const bookMeta = orderSummary.items.books.find(b => b.id === entry.bookId);
          try {
            const res = await apiClient.get<{ stockQuantity?: number | null }>(
              `/book/user/checkout/${entry.bookId}?format=PHYSICAL`
            );
            const available =
              res.success && res.data && res.data.stockQuantity !== undefined
                ? Number(res.data.stockQuantity ?? 0)
                : null;

            if (available !== null && available < entry.quantity) {
              return {
                bookId: entry.bookId,
                title: bookMeta?.title || "This book",
                requested: entry.quantity,
                available,
              } as StockIssue;
            }
            return null;
          } catch (err) {
            console.error(`Failed to verify stock for book ${entry.bookId}:`, err);
            return null;
          }
        })
      );

      const issues = results.filter((r): r is StockIssue => r !== null);
      setStockIssues(issues);
      return issues;
    } catch (error) {
      console.error("Stock verification failed:", error);
      setStockCheckError("Couldn't verify book stock right now. Please try again.");
      return [];
    } finally {
      setIsCheckingStock(false);
    }
  }

  // Run an initial stock check once we know which physical books are in the order.
  useEffect(() => {
    if (hasPhysicalBook) {
      verifyPhysicalStock();
    } else {
      setStockIssues([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPhysicalBook, orderSummary.items.books.length]);

  // ---- Location cascading ----
  const filteredDistricts = useMemo(
    () => districts.filter(d => d.division_id === shippingDetails.divisionId),
    [shippingDetails.divisionId]
  );

  const filteredUpazilas = useMemo(
    () => upazilas.filter(u => u.district_id === shippingDetails.districtId),
    [shippingDetails.districtId]
  );

  const selectedDistrict = useMemo(
    () => districts.find(d => d.id === shippingDetails.districtId) || null,
    [shippingDetails.districtId]
  );

  // Auto-derived delivery area — no manual toggle needed.
  const deliveryArea: "" | "INSIDE_DHAKA" | "OUTSIDE_DHAKA" = !shippingDetails.districtId
    ? ""
    : shippingDetails.districtId === DHAKA_DISTRICT_ID
      ? "INSIDE_DHAKA"
      : "OUTSIDE_DHAKA";

  const totalPhysicalWeight = orderSummary.items.books.reduce((total, book) => {
    const quantityMeta = targetBooks.find(item => item.bookId === book.id);
    if (quantityMeta?.format !== "PHYSICAL") return total;
    return total + Number(book.weight || 0) * (quantityMeta.quantity || 1);
  }, 0);

  const baseShippingCost = !hasPhysicalBook
    ? 0
    : deliveryArea === "INSIDE_DHAKA"
      ? 80
      : deliveryArea === "OUTSIDE_DHAKA"
        ? 130
        : 0;

  const extraWeightCharge = hasPhysicalBook
    ? Math.ceil(Math.max(0, totalPhysicalWeight - 2)) * 20
    : 0;

  const shippingCost = baseShippingCost + extraWeightCharge;
  const grandTotal = Number(orderSummary.subtotal || 0) + shippingCost;

  // Validate form requirements
  const isFormValid =
    !hasPhysicalBook ||
    (shippingDetails.fullName.trim() !== "" &&
      shippingDetails.phoneNumber.trim() !== "" &&
      shippingDetails.addressLine.trim() !== "" &&
      shippingDetails.postalCode.trim() !== "" &&
      shippingDetails.divisionId !== "" &&
      shippingDetails.districtId !== "" &&
      shippingDetails.upazilaId !== "");

  const canCheckout = isFormValid && stockIssues.length === 0 && !isCheckingStock;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setShippingDetails(prev => {
      if (name === "divisionId") {
        // Reset downstream selections when the division changes
        return { ...prev, divisionId: value, districtId: "", upazilaId: "" };
      }
      if (name === "districtId") {
        return { ...prev, districtId: value, upazilaId: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!isFormValid) return;

    // Final stock guard right before placing the order — closes the race
    // condition where stock changed after the page loaded.
    if (hasPhysicalBook) {
      const issues = await verifyPhysicalStock();
      if (issues.length > 0) {
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const division = divisions.find(d => d.id === shippingDetails.divisionId);
      const district = selectedDistrict;
      const upazila = upazilas.find(u => u.id === shippingDetails.upazilaId);

      const checkoutPayload = {
        paymentMethod: paymentMethod,
        shippingDetails: hasPhysicalBook
          ? {
              fullName: shippingDetails.fullName,
              phoneNumber: shippingDetails.phoneNumber,
              addressLine: shippingDetails.addressLine,
              postalCode: shippingDetails.postalCode,
              deliveryArea, // auto-derived
              division: division ? { id: division.id, name: division.name } : null,
              district: district ? { id: district.id, name: district.name } : null,
              upazila: upazila ? { id: upazila.id, name: upazila.name } : null,
            }
          : null,
        orderSummary: orderSummary,
      };

      const response = await apiClient.post<{
        gatewayUrl?: string;
        orderId: string;
        paymentType: "CASH_ON_DELIVERY" | "ONLINE_PAYMENT";
      }>("/order/create-order-with-UDDOKTAPAY", checkoutPayload);

      if (response.success) {
        if (response.data?.paymentType === "CASH_ON_DELIVERY") {
          router.replace(`/dashboard/student/orders/${response.data.orderId}?placed=true`);
        } else if (response.data?.gatewayUrl) {
          window.location.href = response.data.gatewayUrl;
        } else {
          router.push("/checkout");
        }
      } else {
        // Surface a backend-side stock rejection (final source of truth) if present.
        console.error("Checkout failed:", response.errors);
        setStockCheckError(
          typeof response.errors === "string"
            ? response.errors
            : "Checkout failed. Please review your order and try again."
        );
      }
    } catch (error) {
      console.error("Error during checkout process:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    {
      id: "CASH_ON_DELIVERY" as const,
      icon: Banknote,
      label: "Cash on Delivery",
      description: hasPhysicalBook ? "Pay when your order arrives" : "Available for physical books",
      disabled: !hasPhysicalBook,
    },
    {
      id: "ONLINE_PAYMENT" as const,
      icon: CreditCard,
      label: "Online Payment",
      description: "Pay securely through the gateway",
      disabled: false,
    },
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
                        ৳{item.discountPrice ?? item.originalPrice}
                      </p>
                      {item.discountPrice && (
                        <p className='text-xs text-gray-400 line-through'>৳{item.originalPrice}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loop Through Books */}
                {orderSummary?.items.books?.map((item: any) => {
                  // Find all format entries matching this book ID
                  const bookQuantities =
                    orderSummary?.quantities?.books?.filter(b => b.bookId === item.id) || [];

                  const hasPhysicalInQuantities = bookQuantities.some(b => b.format === "PHYSICAL");
                  const hasEbookInQuantities = bookQuantities.some(b => b.format === "EBOOK");

                  // Both formats stored -> prioritize PHYSICAL display and grant FREE E-Book
                  const hasBothFormats = hasPhysicalInQuantities && hasEbookInQuantities;

                  // Render as Physical if explicitly selected or if both are present
                  const isPhysical =
                    hasPhysicalInQuantities || (hasBothFormats && !hasEbookInQuantities);

                  // Free E-Book badge and $0 pricing ONLY show when both formats are present in storage
                  const showFreeEBook = isPhysical && hasBothFormats;

                  // Retrieve total or primary selected quantity
                  const primaryQuantity =
                    bookQuantities.find(b => b.format === (isPhysical ? "PHYSICAL" : "EBOOK"))
                      ?.quantity || 1;

                  const stockIssue = isPhysical
                    ? stockIssues.find(issue => issue.bookId === item.id)
                    : undefined;

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

                            {isPhysical ? (
                              <>
                                <span className='inline-block text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border border-purple-100'>
                                  Physical Book
                                </span>
                                {showFreeEBook && (
                                  <span className='inline-block text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border border-emerald-100'>
                                    E-Book (Free)
                                  </span>
                                )}
                                {stockIssue && (
                                  <span className='inline-block text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border border-red-200'>
                                    {stockIssue.available <= 0
                                      ? "Out of stock"
                                      : `Only ${stockIssue.available} left`}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className='inline-block text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border border-teal-100'>
                                E-Book
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
                        <span className='text-sm font-bold text-[#074079]'>{primaryQuantity}</span>
                      </div>

                      <div className='text-right shrink-0 w-28'>
                        {isPhysical ? (
                          <>
                            <p className='text-sm font-semibold text-[#DA7C36]'>
                              ৳
                              {item.physicalSalePrice ??
                                item.physicalRegularPrice ??
                                item.discountPrice ??
                                item.originalPrice}
                            </p>

                            {/* RENDER ORIGINAL PRICE WITH STRIKETHROUGH FOR PHYSICAL BOOKS */}
                            {item.physicalSalePrice && item.physicalRegularPrice && (
                              <p className='text-xs text-gray-400 line-through'>
                                ৳{item.physicalRegularPrice}
                              </p>
                            )}

                            {showFreeEBook && (
                              <p className='text-[10px] text-emerald-600 font-medium'>
                                Digital: ৳0 (Free)
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className='text-sm font-semibold text-[#DA7C36]'>
                              ৳
                              {item.digitalSalePrice ??
                                item.digitalRegularPrice ??
                                item.discountPrice ??
                                item.originalPrice}
                            </p>
                            {item.digitalSalePrice && item.digitalRegularPrice && (
                              <p className='text-xs text-gray-400 line-through'>
                                ৳{item.digitalRegularPrice}
                              </p>
                            )}
                          </>
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

            {/* Out-of-stock summary banner */}
            {hasPhysicalBook && stockIssues.length > 0 && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 animate-fade-in'>
                <p className='font-semibold mb-1'>Some physical books are no longer available:</p>
                <ul className='list-disc list-inside space-y-0.5'>
                  {stockIssues.map(issue => (
                    <li key={issue.bookId}>
                      {issue.title} — requested {issue.requested}, only {issue.available} in stock
                    </li>
                  ))}
                </ul>
                <p className='mt-2 text-xs text-red-500'>
                  Please update the quantity or remove this item from your cart to continue.
                </p>
              </div>
            )}
            {stockCheckError && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-600'>
                {stockCheckError}
              </div>
            )}

            {/* DYNAMIC SHIPPING FORM */}
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
                  You have physical items in your order. Select your division, district and upazila
                  — we&apos;ll work out the delivery zone and cost automatically.
                </p>

                {deliveryArea && (
                  <div className='mb-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 text-[#074079] rounded-md text-xs font-medium'>
                    <MapPin className='w-4 h-4 text-[#DA7C36] shrink-0' />
                    {deliveryArea === "INSIDE_DHAKA"
                      ? "Detected: Inside Dhaka — delivery charge ৳80"
                      : "Detected: Outside Dhaka — delivery charge ৳130"}
                  </div>
                )}

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-xs font-semibold text-gray-700 mb-1'>
                      Division *
                    </label>
                    <select
                      name='divisionId'
                      required
                      value={shippingDetails.divisionId}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-hidden focus:border-[#DA7C36] transition-colors'
                    >
                      <option value=''>Select division</option>
                      {divisions.map(division => (
                        <option
                          key={division.id}
                          value={division.id}
                        >
                          {division.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-gray-700 mb-1'>
                      District *
                    </label>
                    <select
                      name='districtId'
                      required
                      disabled={!shippingDetails.divisionId}
                      value={shippingDetails.districtId}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-hidden focus:border-[#DA7C36] transition-colors disabled:bg-gray-50 disabled:text-gray-400'
                    >
                      <option value=''>Select district</option>
                      {filteredDistricts.map(district => (
                        <option
                          key={district.id}
                          value={district.id}
                        >
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='sm:col-span-2'>
                    <label className='block text-xs font-semibold text-gray-700 mb-1'>
                      Upazila *
                    </label>
                    <select
                      name='upazilaId'
                      required
                      disabled={!shippingDetails.districtId}
                      value={shippingDetails.upazilaId}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-hidden focus:border-[#DA7C36] transition-colors disabled:bg-gray-50 disabled:text-gray-400'
                    >
                      <option value=''>Select upazila</option>
                      {filteredUpazilas.map(upazila => (
                        <option
                          key={upazila.id}
                          value={upazila.id}
                        >
                          {upazila.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                </div>
              </div>
            )}

            {/* Payment Options Wrapper */}
            <div
              className='bg-white rounded-lg shadow-md p-6 sm:p-8 animate-fade-in'
              style={{ animationDelay: "150ms" }}
            >
              <h2 className='text-lg font-bold text-[#074079] mb-6'>Payment Option</h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4'>
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    type='button'
                    disabled={method.disabled}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-lg border transition-all duration-300 flex items-center gap-3 text-left cursor-pointer hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${
                      paymentMethod === method.id
                        ? "border-[#DA7C36] bg-orange-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm'>
                      <method.icon
                        className={`h-5 w-5 ${
                          paymentMethod === method.id ? "text-[#DA7C36]" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <span>
                      <span className='block text-sm font-semibold text-gray-800'>
                        {method.label}
                      </span>
                      <span className='block text-xs text-gray-500'>{method.description}</span>
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
                  <span className='font-semibold'>
                    ৳{Number(orderSummary.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between text-gray-700'>
                  <span>Shipping</span>
                  <span className='font-semibold'>
                    {hasPhysicalBook && !deliveryArea
                      ? "Select location"
                      : `৳${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                {hasPhysicalBook && totalPhysicalWeight > 0 && (
                  <div className='flex justify-between text-xs text-gray-500'>
                    <span>Physical weight</span>
                    <span>{totalPhysicalWeight.toFixed(2)} kg</span>
                  </div>
                )}
                {extraWeightCharge > 0 && (
                  <div className='flex justify-between text-xs text-gray-500'>
                    <span>Extra weight charge</span>
                    <span>৳{extraWeightCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className='flex justify-between text-lg font-bold text-[#074079] pt-3 border-t border-gray-200'>
                  <span>Total</span>
                  <span className='text-[#DA7C36]'>৳{grandTotal.toFixed(2)} BDT</span>
                </div>
              </div>

              <button
                disabled={!canCheckout || isSubmitting}
                onClick={handleCheckout}
                className='w-full mt-6 py-3 bg-linear-to-r from-[#DA7C36] to-orange-dark text-white rounded-lg font-bold text-base hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
              >
                {isSubmitting ? (
                  <span className='animate-pulse'>PROCESSING...</span>
                ) : isCheckingStock ? (
                  <span className='animate-pulse'>CHECKING STOCK...</span>
                ) : stockIssues.length > 0 ? (
                  "ITEM OUT OF STOCK"
                ) : !isFormValid ? (
                  "FILL SHIPPING DETAILS"
                ) : paymentMethod === "CASH_ON_DELIVERY" ? (
                  "PLACE COD ORDER"
                ) : (
                  "CONTINUE TO PAYMENT"
                )}
                {!isSubmitting && !isCheckingStock && <ArrowRight className='w-5 h-5' />}
              </button>

              {!canCheckout && !isCheckingStock && (
                <p className='text-[11px] text-red-500 text-center mt-2 font-medium'>
                  {stockIssues.length > 0
                    ? "Please resolve the out-of-stock item(s) above to continue."
                    : "Delivery address details are required to buy physical books."}
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
