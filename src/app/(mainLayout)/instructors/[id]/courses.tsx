//courses.tsx - COURSES TAB COMPONENT
import { Clock, PlayCircle, Star, Users } from "lucide-react";
import Image from "next/image";

interface Course {
  id: number;
  image: string;
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  students: number;
  lessons: number;
  duration: string;
}

export function CoursesTab({ courses }: { courses: Course[] }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-content'>
      {courses.map((course, index) => (
        <div
          key={course.id}
          className='bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-scale-in'
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className='relative h-48 overflow-hidden'>
            <Image
              width={500}
              height={300}
              src={course.image}
              alt={course.title}
              className='w-full h-full object-cover hover:scale-110 transition-transform duration-500'
            />
            <div className='absolute top-3 right-3 bg-white px-3 py-1 rounded-full'>
              <span className='text-[#DA7C36] font-bold text-sm'>${course.price}</span>
              <span className='text-gray-400 line-through text-xs ml-1'>
                ${course.originalPrice}
              </span>
            </div>
          </div>
          <div className='p-4'>
            <h4 className='font-bold text-[#074079] mb-3 line-clamp-2 min-h-[3rem]'>
              {course.title}
            </h4>
            <div className='flex items-center justify-between text-sm text-gray-600 mb-3'>
              <div className='flex items-center gap-1'>
                <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                <span>{course.rating}</span>
              </div>
              <div className='flex items-center gap-1'>
                <Users className='w-4 h-4' />
                <span>{course.students.toLocaleString()}</span>
              </div>
            </div>
            <div className='flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100'>
              <div className='flex items-center gap-1'>
                <PlayCircle className='w-4 h-4' />
                <span>{course.lessons} Lessons</span>
              </div>
              <div className='flex items-center gap-1'>
                <Clock className='w-4 h-4' />
                <span>{course.duration}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out both;
        }
      `}</style>
    </div>
  );
}
