import { type ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  gradient = "from-orange-50 to-orange-100",
}: FeatureCardProps) {
  return (
    <div
      className={`
      group relative p-6 bg-gradient-to-br ${gradient} rounded-2xl 
      hover:shadow-xl transition-all duration-300 hover:-translate-y-1
      border border-gray-100
    `}
    >
      <div className='flex flex-col items-start space-y-4'>
        <div className='p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300'>
          {icon}
        </div>
        <h3 className='text-lg font-bold text-gray-900'>{title}</h3>
        <p className='text-sm text-gray-600 leading-relaxed'>{description}</p>
      </div>
    </div>
  );
}
