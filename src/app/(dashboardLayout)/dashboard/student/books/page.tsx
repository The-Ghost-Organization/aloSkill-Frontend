import { mockBooks } from "./Mockbooks";
import { MyBooksView } from "./Mybooksview";

// Replace mockBooks with a real fetch from your API / DB, e.g.:
// const books = await getPurchasedBooks(userId);

export default function BooksPage() {
  return (
    <div className=''>
      <MyBooksView books={mockBooks} />
    </div>
  );
}
