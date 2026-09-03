import { mockBooks } from "./Mockbooks";
import { MyBooksView } from "./Mybooksview";
import { getUserBookData } from './userBookAction';

const books = await getUserBookData();

export default function BooksPage() {
  return (
    <div className=''>
      <MyBooksView books={mockBooks} />
    </div>
  );
}
