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
