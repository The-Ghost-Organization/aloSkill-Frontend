// data/books.ts

import type { Book } from "@/types/book.ts";

/**
 * Mock books data
 * TODO: Replace with API call in production
 */
export const mockBooks: Book[] = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    price: 450.0,
    originalPrice: 600.0,
    discount: 25,
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80",
    rating: 5,
    reviews: 134,
    category: "Fiction",
    brand: "Penguin Books",
    sku: "PB001234",
    availability: "In Stock",
    description:
      "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices...",
    images: [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    ],
    features: [
      "Hardcover edition with dust jacket",
      "First edition printing",
      "Author signed bookplate included",
    ],
    specifications: {
      Pages: "304",
      Publisher: "Penguin Books",
      Language: "English",
      ISBN: "978-0525559474",
      Dimensions: "6.3 x 1.1 x 9.5 inches",
    },
  },
  {
    id: 2,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    price: 520.0,
    originalPrice: 650.0,
    discount: 20,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
    rating: 5,
    reviews: 234,
    category: "Thriller",
    brand: "Celadon Books",
    sku: "CB002345",
    availability: "In Stock",
    description:
      "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows overlooking a park in one of London's most desirable areas...",
    images: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    ],
    features: [
      "Bestselling psychological thriller",
      "Movie adaptation in development",
      "International edition",
    ],
    specifications: {
      Pages: "336",
      Publisher: "Celadon Books",
      Language: "English",
      ISBN: "978-1250301697",
      Dimensions: "5.4 x 1.2 x 8.2 inches",
    },
  },
  {
    id: 3,
    title: "Atomic Habits",
    author: "James Clear",
    price: 380.0,
    originalPrice: 500.0,
    discount: 24,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    rating: 5,
    reviews: 567,
    category: "Self-Help",
    brand: "Avery",
    sku: "AV003456",
    availability: "In Stock",
    description:
      "No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits...",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80",
    ],
    features: [
      "Over 5 million copies sold worldwide",
      "Practical habit-building strategies",
      "Revised and updated edition",
    ],
    specifications: {
      Pages: "320",
      Publisher: "Avery",
      Language: "English",
      ISBN: "978-0735211292",
      Dimensions: "5.5 x 1 x 8.2 inches",
    },
  },
  {
    id: 4,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    price: 420.0,
    originalPrice: 550.0,
    discount: 24,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    rating: 4,
    reviews: 189,
    category: "Finance",
    brand: "Harriman House",
    sku: "HH004567",
    availability: "In Stock",
    description:
      "Doing well with money isn't necessarily about what you know. It's about how you behave. And behavior is hard to teach, even to really smart people...",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
    ],
    features: [
      "Timeless lessons on wealth, greed, and happiness",
      "19 short stories exploring the psychology of money",
      "Wall Street Journal bestseller",
    ],
    specifications: {
      Pages: "256",
      Publisher: "Harriman House",
      Language: "English",
      ISBN: "978-0857197689",
      Dimensions: "5.3 x 0.9 x 7.9 inches",
    },
  },
  {
    id: 5,
    title: "Educated",
    author: "Tara Westover",
    price: 490.0,
    originalPrice: 600.0,
    discount: 18,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
    rating: 5,
    reviews: 345,
    category: "Memoir",
    brand: "Random House",
    sku: "RH005678",
    availability: "In Stock",
    description:
      "An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University...",
    images: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    ],
    features: [
      "New York Times Bestseller",
      "Bill Gates' Book of the Year",
      "Featured on Oprah's Book Club",
    ],
    specifications: {
      Pages: "352",
      Publisher: "Random House",
      Language: "English",
      ISBN: "978-0399590504",
      Dimensions: "6.1 x 1.1 x 9.5 inches",
    },
  },
  {
    id: 6,
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    price: 550.0,
    originalPrice: 700.0,
    discount: 21,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    rating: 4,
    reviews: 278,
    category: "Psychology",
    brand: "Farrar, Straus and Giroux",
    sku: "FSG006789",
    availability: "In Stock",
    description:
      "In this work, Daniel Kahneman, the renowned psychologist and winner of the Nobel Prize in Economics, takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think...",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80",
    ],
    features: [
      "Nobel Prize winner insights",
      "Groundbreaking behavioral economics",
      "International bestseller",
    ],
    specifications: {
      Pages: "499",
      Publisher: "Farrar, Straus and Giroux",
      Language: "English",
      ISBN: "978-0374533557",
      Dimensions: "6.1 x 1.4 x 9.2 inches",
    },
  },
];

/**
 * Get all books
 * In production, this would be an API call
 */
export const getAllBooks = async (): Promise<Book[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockBooks;
};

/**
 * Get book by ID
 * In production, this would be an API call
 */
export const getBookById = async (id: number): Promise<Book | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockBooks.find(book => book.id === id) || null;
};

/**
 * Get books by category
 * In production, this would be an API call
 */
export const getBooksByCategory = async (category: string): Promise<Book[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockBooks.filter(book => book.category === category);
};

/**
 * Search books
 * In production, this would be an API call
 */
export const searchBooks = async (query: string): Promise<Book[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  const lowerQuery = query.toLowerCase();
  return mockBooks.filter(
    book =>
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.category?.toLowerCase().includes(lowerQuery)
  );
};
