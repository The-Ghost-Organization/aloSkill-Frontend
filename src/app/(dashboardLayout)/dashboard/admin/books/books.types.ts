export type BookState = {
  totalBooks: number;
  totalSold: number;
  totalStock: number;
  totalRevenue: number;
  bookBreakdown: {
    id: string;
    status: string;
    title: string;
    author: string;
    regularPrice: number;
    salePrice: number;
    stock: number;
    formats: string[];
    orderItem: {
      id: string;
      price: number;
    }[];
    totalEarning: number;
  }[];
};
