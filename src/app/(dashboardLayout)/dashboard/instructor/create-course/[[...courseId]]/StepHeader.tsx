import React from "react";

const StepHeader = ({
  headingText,
}: {
  headingText: string;
}) => {
  return (
    <div className='flex items-center justify-between border-b p-4 border-gray-200'>
      <h2 className='font-semibold text-gray-900'>{headingText}</h2>
    </div>
  );
};

export default StepHeader;
