import React from "react";

const StepHeader = ({
  headingText,
  description,
  aside,
}: {
  headingText: string;
  description?: React.ReactNode;
  aside?: React.ReactNode;
}) => {
  return (
    <div className='flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 px-4 py-6 sm:px-8'>
      <div className='max-w-prose'>
        <h2 className='text-xl font-semibold text-gray-900'>{headingText}</h2>
        {description && <p className='mt-1 text-sm leading-relaxed text-gray-500'>{description}</p>}
      </div>
      {aside}
    </div>
  );
};

export default StepHeader;
