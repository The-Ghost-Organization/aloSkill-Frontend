export const MAX_PRICE = 5000;
export const GENRES = [
  "Fiction",
  "Non-Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Thriller",
  "Biography",
  "History",
  "Self-Help",
  "Romance",
] as const;

export type Genre = (typeof GENRES)[number];

export type BookResponse = {
  id: string;
  title: string;
  author: string;
  authorProfile?: { id: string; name: string; slug: string } | null;

  physicalRegularPrice: number | null;
  physicalSalePrice: number | null;
  digitalRegularPrice: number | null;
  digitalSalePrice: number | null;

  stock: "in-stock" | "limited" | "out-of-stock";

  publisher: string;
  createdAt: string;

  category: {
    name: string;
  } | null;

  formats: string[];
  coverImage: string;
}[];

export type BookDetailsResponse = {
  id: string;
  title: string;
  author: string;
  authorProfile: {
    id: string;
    name: string;
    slug: string;
    photoUrl: string | null;
    bio: string | null;
    instructorProfileId: string | null;
  } | null;
  translator: string | null;
  editor: string | null;
  publisher: string;
  description: string;
  stock: number;
  isbn: string | null;
  edition: string | null;
  pages: number | null;
  language: string;
  category: {
    name: string;
  } | null;
  formats: string[];
  files: {
    url: string;
    name: string;
    fileType: string;
  }[];
  createdAt: Date;
  physicalRegularPrice: number | null;
  physicalSalePrice: number | null;
  digitalRegularPrice: number | null;
  digitalSalePrice: number | null;
  coverImage: string;
  ratings: number;
  reviewCount: number;
  owner: {
    status: string;
    avatarUrl: string | null;
    instructorProfile: {
      displayName: string;
      qualifications: string;
      expertise: string | null;
    } | null;
  };
};


export type BookReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  reviewer: {
    displayName: string;
    avatarUrl: string | null;
  };
  verifiedPurchase: boolean;
};

export type BookReviewsResponse = {
  items: BookReview[];
  summary: {
    average: number;
    count: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

export type BookReviewStatusResponse = {
  canReview: boolean;
  hasPurchased: boolean;
  existingReview: {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    createdAt: string;
    flagged: boolean;
  } | null;
};

export type SubmitBookReviewResponse = {
  review: BookReview;
  summary: {
    average: number;
    count: number;
  };
  updated: boolean;
};
