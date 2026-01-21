import { type ReactNode } from "react";

interface CategoryCardProps {
  icon: ReactNode;
  title: string;
  courseCount: number;
  gradient: string;
}

export default function CategoryCard({ icon, title, courseCount, gradient }: CategoryCardProps) {
  return (
    <a
      href={`/categories/${title.toLowerCase().replace(/\s+/g, "-")}`}
      className={`
        group relative p-6 bg-gradient-to-br ${gradient} rounded-2xl 
        hover:shadow-xl transition-all duration-300 hover:-translate-y-2
        border border-gray-100 overflow-hidden
      `}
    >
      {/* Background Pattern */}
      <div className='absolute -right-6 -bottom-6 opacity-10'>
        <div className='w-32 h-32 scale-150'>{icon}</div>
      </div>

      {/* Content */}
      <div className='relative z-10 space-y-3'>
        <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300'>
          {icon}
        </div>
        <h3 className='text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors'>
          {title}
        </h3>
        <p className='text-sm text-gray-600'>{courseCount} courses available</p>
      </div>
    </a>
  );
}
