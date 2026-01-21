import { Quote, Star, Verified } from "lucide-react";
import Image from "next/image";

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  image: string;
  rating: number;
  testimonial: string;
  bgGradient?: string;
}

export default function TestimonialCard({
  name,
  role,
  company,
  image,
  rating,
  testimonial,
  bgGradient = "from-blue-50 to-indigo-50",
}: TestimonialCardProps) {
  return (
    <div className='relative w-full h-full flex items-center justify-center p-4 md:p-6'>
      <div
        className={`relative w-full max-w-4xl bg-linear-to-br ${bgGradient} rounded-2xl shadow-xl p-4  md:p-12`}
      >
        {/* Quote Icon */}
        <div className='absolute top-6 left-6 text-blue-200 opacity-50'>
          <Quote
            className='w-16 h-16'
            fill='currentColor'
          />
        </div>

        {/* Content Container */}
        <div className='relative z-10 flex flex-col md:flex-row gap-8 items-center'>
          {/* Avatar Section */}
          <div className='shrink-0'>
            <div className='relative'>
              <div className='w-16 h-16 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl'>
                <Image
                  width={100}
                  height={100}
                  src={image}
                  alt={name}
                  className='w-full h-full object-cover'
                />
              </div>
              {/* Verified Badge */}
              <div className='absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 shadow-lg'>
                <Verified className='w-5 h-5' />
             
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className='flex-1 text-center md:text-left'>
            {/* Star Rating */}
            <div className='flex gap-1 mb-4 justify-center md:justify-start'>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 md:w-5 md:h-5 ${
                    i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Testimonial Text */}
            <p className='text-gray-700 text-md md:text-lg leading-relaxed mb-6 italic'>
              {testimonial}
            </p>

            {/* Author Info */}
            <div className='space-y-1'>
              <h3 className='text-lg md:text-2xl font-bold text-gray-900'>{name}</h3>
              <p className='text-blue-600 font-semibold text-sm '>{role}</p>
              <p className='text-gray-500 text-sm '>{company}</p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className='absolute bottom-0 right-0 w-32 h-32 bg-blue-300 rounded-tl-full opacity-15'></div>
        <div className='absolute top-0 right-0 w-24 h-24 bg-indigo-300 rounded-bl-full opacity-15'></div>
      </div>
    </div>
  );
}
