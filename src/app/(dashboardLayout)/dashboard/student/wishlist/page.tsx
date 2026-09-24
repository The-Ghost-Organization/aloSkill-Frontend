"use client";

import { useSessionContext } from "@/app/contexts/SessionContext";
import { apiClient } from "@/lib/api/client";
import { courseDraftStorage } from "@/lib/storage/courseDraftStorage";
import { BookOpen, Heart, RefreshCw, ShoppingCart, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardState from "../components/DashboardState";

type WishlistItem = {
  id: string;
  createdAt: string;
  course: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    originalPrice: number;
    discountPrice: number | null;
    ratingAverage: number;
    createdBy: { displayName: string } | null;
  } | null;
  book: {
    id: string;
    title: string;
    author: string;
    coverImage: string;
    formats: string[];
    physicalRegularPrice: number | null;
    physicalSalePrice: number | null;
    digitalRegularPrice: number | null;
    digitalSalePrice: number | null;
  } | null;
};

const money = (value: number | null) => (value === null ? "—" : `৳${Number(value).toLocaleString("en-BD")}`);

export default function WishlistPage() {
  const { setCartUpdate } = useSessionContext();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState("");

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get<WishlistItem[]>("/user/student/me/wishlist");
      if (!response.success) throw new Error("Could not load wishlist");
      setItems(response.data ?? []);
    } catch {
      setError("We could not load your wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  const removeItem = async (id: string) => {
    setRemovingId(id);
    setError("");
    try {
      const response = await apiClient.delete(`/user/student/me/wishlist/${id}`);
      if (!response.success) throw new Error("Could not remove wishlist item");
      setItems(current => current.filter(item => item.id !== id));
    } catch {
      setError("The wishlist item could not be removed.");
    } finally {
      setRemovingId(null);
    }
  };

  const addCourseToCart = (courseId: string, title: string) => {
    const cart = courseDraftStorage.get<{ courseId: string; quantity: number }[]>() ?? [];
    if (!cart.some(item => item.courseId === courseId)) {
      cart.push({ courseId, quantity: 1 });
      courseDraftStorage.save(cart);
      setCartUpdate?.(current => !current);
    }
    setCartMessage(`${title} is in your cart.`);
  };

  const courseCount = useMemo(() => items.filter(item => item.course).length, [items]);
  const bookCount = items.length - courseCount;

  if (loading) return <DashboardState kind='loading' title='Loading wishlist' description='Getting your saved courses and books.' />;
  if (error && items.length === 0) return <DashboardState kind='error' title='Wishlist is unavailable' description={error} action={<button type='button' onClick={() => void loadWishlist()} className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white'>Try again</button>} />;
  if (items.length === 0) return <DashboardState kind='empty' icon={Heart} title='Your wishlist is empty' description='Courses and books you save for later will appear here.' action={<div className='flex gap-2'><Link href='/courses' className='rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white'>Browse courses</Link><Link href='/books' className='rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700'>Browse books</Link></div>} />;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Wishlist</h1>
          <p className='mt-1 text-sm text-gray-500'>{courseCount} course{courseCount === 1 ? "" : "s"} · {bookCount} book{bookCount === 1 ? "" : "s"}</p>
        </div>
        <button type='button' onClick={() => void loadWishlist()} className='inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-300'>
          <RefreshCw className='h-4 w-4' /> Refresh
        </button>
      </div>

      {(error || cartMessage) && <div className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>{error || cartMessage}</div>}

      <div className='grid gap-4 md:grid-cols-2'>
        {items.map(item => {
          if (item.course) {
            const course = item.course;
            const price = course.discountPrice ?? course.originalPrice;
            return (
              <article key={item.id} className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
                <div className='flex gap-4 p-4'>
                  <Link href={`/courses/${course.id}`} className='relative h-28 w-36 shrink-0 overflow-hidden rounded-lg bg-gray-100'>
                    {course.thumbnailUrl ? <Image src={course.thumbnailUrl} alt={course.title} fill sizes='144px' className='object-cover' /> : <div className='flex h-full items-center justify-center text-gray-300'><BookOpen className='h-8 w-8' /></div>}
                  </Link>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-orange-600'>Course</p>
                    <Link href={`/courses/${course.id}`} className='mt-1 block line-clamp-2 font-bold text-gray-900 hover:text-orange-600'>{course.title}</Link>
                    <p className='mt-1 text-xs text-gray-500'>by {course.createdBy?.displayName ?? "AloSkill Instructor"}</p>
                    <div className='mt-2 flex items-center gap-3'><span className='font-bold text-gray-900'>{money(price)}</span><span className='flex items-center gap-1 text-xs text-gray-500'><Star className='h-3.5 w-3.5 fill-amber-400 text-amber-400' /> {course.ratingAverage.toFixed(1)}</span></div>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2 border-t border-gray-100 p-4'>
                  <button type='button' onClick={() => addCourseToCart(course.id, course.title)} className='inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100'><ShoppingCart className='h-4 w-4' /> Add to cart</button>
                  <Link href={`/checkout?courseId=${course.id}`} className='flex-1 rounded-lg bg-orange-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-orange-600'>Buy now</Link>
                  <button type='button' disabled={removingId === item.id} onClick={() => void removeItem(item.id)} aria-label='Remove from wishlist' className='rounded-lg border border-gray-200 p-2.5 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50'><Trash2 className='h-4 w-4' /></button>
                </div>
              </article>
            );
          }

          if (item.book) {
            const book = item.book;
            const physicalPrice = book.physicalSalePrice ?? book.physicalRegularPrice;
            const digitalPrice = book.digitalSalePrice ?? book.digitalRegularPrice;
            return (
              <article key={item.id} className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
                <div className='flex gap-4 p-4'>
                  <Link href={`/books/${book.id}`} className='relative h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100'>
                    {book.coverImage ? <Image src={book.coverImage} alt={book.title} fill sizes='96px' className='object-contain' /> : <div className='flex h-full items-center justify-center text-gray-300'><BookOpen className='h-8 w-8' /></div>}
                  </Link>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-orange-600'>Book</p>
                    <Link href={`/books/${book.id}`} className='mt-1 block line-clamp-2 font-bold text-gray-900 hover:text-orange-600'>{book.title}</Link>
                    <p className='mt-1 text-xs text-gray-500'>by {book.author}</p>
                    <div className='mt-3 flex flex-wrap gap-2 text-xs text-gray-600'>
                      {book.formats.includes("HARDCOVER") && <span className='rounded-full bg-gray-100 px-2 py-1'>Physical {money(physicalPrice)}</span>}
                      {book.formats.includes("E_BOOK") && <span className='rounded-full bg-gray-100 px-2 py-1'>eBook {money(digitalPrice)}</span>}
                    </div>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2 border-t border-gray-100 p-4'>
                  {book.formats.includes("HARDCOVER") && <Link href={`/checkout?bookId=${book.id}&format=PHYSICAL`} className='flex-1 rounded-lg bg-orange-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-orange-600'>Buy physical</Link>}
                  {book.formats.includes("E_BOOK") && <Link href={`/checkout?bookId=${book.id}&format=EBOOK`} className='flex-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-center text-sm font-semibold text-orange-700 hover:bg-orange-100'>Buy eBook</Link>}
                  <button type='button' disabled={removingId === item.id} onClick={() => void removeItem(item.id)} aria-label='Remove from wishlist' className='rounded-lg border border-gray-200 p-2.5 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50'><Trash2 className='h-4 w-4' /></button>
                </div>
              </article>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
