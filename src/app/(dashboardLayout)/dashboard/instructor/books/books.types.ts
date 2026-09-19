export type InstructorBookState = {
  totalBooks: number;
  totalSold: number;
  totalStock: number;
  totalRevenue: number;
  bookBreakdown: Array<{
    id: string;
    status: "DRAFT" | "PENDING" | "APPROVED";
    title: string;
    author: string;
    physicalRegularPrice: number | null;
    physicalSalePrice: number | null;
    digitalRegularPrice: number | null;
    digitalSalePrice: number | null;
    stock: number;
    formats: string[];
    createdAt: string;
    orderItem: Array<{ id: string; price: number }>;
    totalEarning: number;
  }>;
};

export type BookEditData = {
  id: string;
  title: string;
  author: string;
  translator: string | null;
  editor: string | null;
  publisher: string;
  publishYear: number;
  ratings: number;
  description: string;
  purchaseCost: number;
  physicalRegularPrice: number;
  physicalSalePrice: number;
  digitalRegularPrice: number;
  digitalSalePrice: number;
  stock: number;
  isbn: string | null;
  edition: string | null;
  pages: number | null;
  weight: number | null;
  language: string;
  formats: string[];
  status: string;
  metaKeywords: string | null;
  metaDescription: string | null;
  coverImage: string;
  category: { id: string; name: string; slug: string; parentId: string | null } | null;
  files: Array<{
    id: string;
    createdAt: string;
    name: string;
    url: string;
    fileType: string;
    bookId: string;
  }>;
} | null;
