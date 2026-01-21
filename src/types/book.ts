export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  originalPrice?: number; // For showing discounts
  discount?: number; // Discount percentage
  image: string;
  rating: number;
  reviews: number;
  category?: string;
  brand?: string;
  sku?: string;
  availability?: "In Stock" | "Out of Stock" | "Pre-order";
  description?: string;
  images?: string[]; // Multiple images for product details page
  features?: string[];
  specifications?: Record<string, string>;
}

export interface BookCardProps {
  book: Book;
  isInWishlist: boolean;
  onToggleWishlist: (bookId: number) => void;
  onAddToCart: (bookId: number) => void;
}
