import React from "react";

interface SectionMiddleHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export const SectionMiddleHeader: React.FC<SectionMiddleHeaderProps> = ({
  title,
  subtitle,
  className,
}) => {
  return (
    <div className={`text-center mb-2 space-y-4 ${className || ""}`}>
      <h2 className='text-2xl font-bold'>{title}</h2>
      <p className='text-md text-gray-500 max-w-4xl mx-auto'>{subtitle}</p>
    </div>
  );
};

export default SectionMiddleHeader;
