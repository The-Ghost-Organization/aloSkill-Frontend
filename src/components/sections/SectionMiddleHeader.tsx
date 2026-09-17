import React from "react";

interface SectionMiddleHeaderProps {
  badge?: string;
  title: string;
  color_title?: string;
  subtitle?: string;
  className?: string;
}

export const SectionMiddleHeader: React.FC<SectionMiddleHeaderProps> = ({
  badge,
  title,
  color_title,
  subtitle,
  className,
}) => {
  return (
    <div className={`text-center mb-2 space-y-4 ${className || ""}`}>
      {badge && (
        <div className='inline-block mb-4'>
          <span className='px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm  uppercase tracking-wide'>
            {badge}
          </span>
        </div>
      )}
      <h2 className='text-3xl sm:text-5xl font-bold'>
        {title}{" "}
        <span className='text-transparent bg-clip-text bg-linear-to-r from-orange-700 to-orange-300'>
          {color_title}
        </span>
      </h2>
      <p className='text-md text-gray-500 max-w-4xl mx-auto'>{subtitle}</p>
    </div>
  );
};

export default SectionMiddleHeader;
