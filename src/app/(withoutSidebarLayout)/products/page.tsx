
"use client";

import { BookCard } from "@/components/cards/BookCard";
import { getAllBooks } from "@/data/books";
import { type Book } from "@/types/book";
import { Grid3x3, LayoutGrid, Search } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Products/Shop Page Component
 * Displays all available books with filtering, sorting, and search functionality
 *
 * Features:
 * - Search functionality
 * - Category filtering
 * - Sort by price, rating, name
 * - Grid layout toggle
 * - Wishlist integration
 */
export default function ProductsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch books on component mount
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const allBooks = await getAllBooks();
        setBooks(allBooks);
        setFilteredBooks(allBooks);
      } catch (_error) {
        // console.error("Failed to fetch books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Get unique categories
  const categories = ["all", ...new Set(books.map(book => book.category).filter(Boolean))];

  // Filter and sort books
  useEffect(() => {
    let result = [...books];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        book =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(book => book.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "name-az":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-za":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    setFilteredBooks(result);
  }, [books, searchQuery, selectedCategory, sortBy]);

  // Wishlist handlers
  const toggleWishlist = (bookId: number) => {
    setWishlist(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const handleAddToCart = (bookId: number) => {
    // console.log("Added to cart:", bookId);
    // TODO: Implement cart functionality
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50'>
      {/* Page Header */}
      <div className='bg-[var(--color-text-dark)] text-white py-16'>
        <div className='max-w-7xl mx-auto px-4'>
          <h1 className='text-4xl md:text-5xl font-bold mb-4'>Discover Your Next Great Read</h1>
          <p className='text-lg text-gray-200'>Browse through our extensive collection of books</p>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Filters and Search Bar */}
        <div className='bg-white rounded-2xl shadow-lg p-6 mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
            {/* Search */}
            <div className='md:col-span-5 relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search books, authors, categories...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[var(--color-orange)] focus:outline-none transition-colors'
              />
            </div>

            {/* Category Filter */}
            <div className='md:col-span-3'>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[var(--color-orange)] focus:outline-none transition-colors cursor-pointer'
              >
                {categories.map(category => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className='md:col-span-3'>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[var(--color-orange)] focus:outline-none transition-colors cursor-pointer'
              >
                <option value='default'>Sort By</option>
                <option value='price-low'>Price: Low to High</option>
                <option value='price-high'>Price: High to Low</option>
                <option value='rating'>Highest Rated</option>
                <option value='name-az'>Name: A to Z</option>
                <option value='name-za'>Name: Z to A</option>
              </select>
            </div>

            {/* Grid Toggle */}
            <div className='md:col-span-1 flex items-center justify-center gap-2'>
              <button
                onClick={() => setGridCols(3)}
                className={`p-2 rounded-lg transition-colors ${
                  gridCols === 3
                    ? "bg-[var(--color-orange)] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                aria-label='3 columns grid'
              >
                <Grid3x3 className='w-5 h-5' />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-2 rounded-lg transition-colors ${
                  gridCols === 4
                    ? "bg-[var(--color-orange)] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                aria-label='4 columns grid'
              >
                <LayoutGrid className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedCategory !== "all" || sortBy !== "default") && (
            <div className='mt-4 flex flex-wrap items-center gap-2'>
              <span className='text-sm text-gray-600 font-semibold'>Active Filters:</span>
              {searchQuery && (
                <span className='px-3 py-1 bg-[var(--color-orange)] text-white text-sm rounded-full'>
                  Search: {searchQuery}
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className='px-3 py-1 bg-[var(--color-orange)] text-white text-sm rounded-full'>
                  Category: {selectedCategory}
                </span>
              )}
              {sortBy !== "default" && (
                <span className='px-3 py-1 bg-[var(--color-orange)] text-white text-sm rounded-full'>
                  Sorted
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSortBy("default");
                }}
                className='px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full hover:bg-gray-300 transition-colors'
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className='flex items-center justify-between mb-6'>
          <p className='text-gray-600'>
            Showing{" "}
            <span className='font-bold text-[var(--color-text-dark)]'>{filteredBooks.length}</span>{" "}
            of <span className='font-bold'>{books.length}</span> books
          </p>
          {wishlist.length > 0 && (
            <p className='text-sm text-gray-500'>
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} in wishlist
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className='text-center py-20'>
            <div className='inline-block w-16 h-16 border-4 border-[var(--color-orange)] border-t-transparent rounded-full animate-spin'></div>
            <p className='mt-4 text-gray-600'>Loading books...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredBooks.length === 0 && (
          <div className='text-center py-20'>
            <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Search className='w-12 h-12 text-gray-400' />
            </div>
            <h3 className='text-2xl font-bold text-gray-800 mb-2'>No books found</h3>
            <p className='text-gray-600 mb-6'>Try adjusting your filters or search query</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSortBy("default");
              }}
              className='px-6 py-3 bg-[var(--color-orange)] hover:bg-[var(--color-orange-dark)] text-white rounded-lg font-semibold transition-colors'
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Books Grid */}
        {!isLoading && filteredBooks.length > 0 && (
          <div
            className={`grid gap-6 ${
              gridCols === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {filteredBooks.map(book => (
              <div
                key={book.id}
                className='flex justify-center'
              >
                <BookCard
                  book={book}
                  isInWishlist={wishlist.includes(book.id)}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        )}

        {/* Load More Button (Optional - for pagination) */}
        {!isLoading && filteredBooks.length > 0 && (
          <div className='text-center mt-12'>
            <p className='text-gray-500 text-sm'>Showing all {filteredBooks.length} books</p>
          </div>
        )}
      </div>
    </div>
  );
}
