import { BooksTab } from "./books";
import InstructorDetailsClient from "./InstructorDetailsClient";

export default async function InstructorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InstructorDetailsClient booksTab={<BooksTab instructorId={id} />} />;
}
