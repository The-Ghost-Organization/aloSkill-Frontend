import { apiClient } from "@/lib/api/client";
import { BookOpen, GraduationCap, Globe2, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type AuthorProfile = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  photoUrl: string | null;
  websiteUrl: string | null;
  instructorProfileId: string | null;
  instructor: {
    userId: string;
    displayName: string;
    expertise: string | null;
  } | null;
  books: {
    id: string;
    title: string;
    author: string;
    coverImage: string;
    physicalRegularPrice: number | null;
    physicalSalePrice: number | null;
    digitalRegularPrice: number | null;
    digitalSalePrice: number | null;
    formats: string[];
    stock: number;
    publisher: string;
    category: { name: string } | null;
  }[];
  courses: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    originalPrice: number;
    discountPrice: number | null;
    ratingAverage: number | null;
    enrollmentCount: number;
    category: { name: string } | null;
  }[];
};

const price = (book: AuthorProfile["books"][number]) =>
  book.physicalSalePrice ??
  book.digitalSalePrice ??
  book.physicalRegularPrice ??
  book.digitalRegularPrice;

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = await apiClient.get<AuthorProfile>(`/book/public/authors/${slug}`);
  const author = response.success ? response.data : null;

  if (!author) notFound();

  return (
    <main className='min-h-screen bg-slate-50 py-14'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
        <section className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'>
          <div className='bg-linear-to-br from-orange-50 via-white to-blue-50 p-6 sm:p-9'>
            <div className='flex flex-col gap-6 sm:flex-row sm:items-center'>
              <div className='flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-orange-100 shadow-sm'>
                {author.photoUrl ? (
                  <Image src={author.photoUrl} alt={author.name} width={112} height={112} className='h-full w-full object-cover' />
                ) : (
                  <UserRound className='h-12 w-12 text-orange-500' />
                )}
              </div>

              <div className='min-w-0 flex-1'>
                <div className='mb-2 flex flex-wrap items-center gap-2'>
                  <span className='rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-700'>Author</span>
                  {author.instructor && (
                    <span className='rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700'>Instructor</span>
                  )}
                </div>
                <h1 className='text-3xl font-black tracking-tight text-slate-950 sm:text-4xl'>{author.name}</h1>
                {author.instructor?.expertise && <p className='mt-2 text-sm font-medium text-slate-500'>{author.instructor.expertise}</p>}
                {author.bio && <p className='mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-600'>{author.bio}</p>}

                <div className='mt-5 flex flex-wrap gap-3'>
                  {author.instructor && (
                    <Link href={`/instructors/${author.instructor.userId}`} className='inline-flex items-center gap-2 rounded-xl bg-[#074079] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#053052]'>
                      <GraduationCap className='h-4 w-4' /> Instructor profile
                    </Link>
                  )}
                  {author.websiteUrl && (
                    <Link href={author.websiteUrl} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600'>
                      <Globe2 className='h-4 w-4' /> Website
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mt-10'>
          <div className='mb-5 flex items-end justify-between gap-4'>
            <div>
              <p className='text-xs font-bold uppercase tracking-[0.2em] text-orange-500'>Publications</p>
              <h2 className='mt-1 text-2xl font-black text-slate-900'>Books by {author.name}</h2>
            </div>
            <span className='text-sm font-semibold text-slate-400'>{author.books.length} books</span>
          </div>

          {author.books.length ? (
            <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
              {author.books.map(book => (
                <Link key={book.id} href={`/books/${book.id}`} className='group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg'>
                  <div className='relative aspect-[3/4] overflow-hidden bg-slate-100'>
                    <Image src={book.coverImage} alt={book.title} fill className='object-cover transition duration-300 group-hover:scale-105' />
                  </div>
                  <div className='p-4'>
                    <p className='text-xs font-semibold uppercase tracking-wider text-orange-500'>{book.category?.name ?? "Book"}</p>
                    <h3 className='mt-1 line-clamp-2 font-bold text-slate-900'>{book.title}</h3>
                    <p className='mt-1 text-sm text-slate-500'>{book.publisher}</p>
                    {price(book) !== null && <p className='mt-3 font-black text-slate-900'>৳{Number(price(book)).toLocaleString("en-BD")}</p>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className='rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500'>No published books are available for this author yet.</div>
          )}
        </section>

        {author.instructor && (
          <section className='mt-12'>
            <div className='mb-5 flex items-end justify-between gap-4'>
              <div>
                <p className='text-xs font-bold uppercase tracking-[0.2em] text-blue-500'>Teaching</p>
                <h2 className='mt-1 text-2xl font-black text-slate-900'>Courses by {author.name}</h2>
              </div>
              <span className='text-sm font-semibold text-slate-400'>{author.courses.length} courses</span>
            </div>

            {author.courses.length ? (
              <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
                {author.courses.map(course => (
                  <Link key={course.id} href={`/courses/${course.id}`} className='group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg'>
                    <div className='relative aspect-video bg-slate-100'>
                      {course.thumbnailUrl ? (
                        <Image src={course.thumbnailUrl} alt={course.title} fill className='object-cover transition duration-300 group-hover:scale-105' />
                      ) : (
                        <div className='flex h-full items-center justify-center'><BookOpen className='h-10 w-10 text-slate-300' /></div>
                      )}
                    </div>
                    <div className='p-5'>
                      <p className='text-xs font-semibold uppercase tracking-wider text-blue-500'>{course.category?.name ?? "Course"}</p>
                      <h3 className='mt-1 line-clamp-2 text-lg font-bold text-slate-900'>{course.title}</h3>
                      <div className='mt-3 flex items-center justify-between text-sm text-slate-500'>
                        <span>{course.enrollmentCount.toLocaleString("en-BD")} students</span>
                        <span className='font-black text-slate-900'>৳{Number(course.discountPrice ?? course.originalPrice).toLocaleString("en-BD")}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className='rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500'>This author is an AloSkill instructor, but has no published courses yet.</div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
