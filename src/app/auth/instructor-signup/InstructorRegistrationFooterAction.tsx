"use client";

import { Loader2 } from "lucide-react";

const InstructorRegistrationFooterAction = ({
  handleCancel,
  isSubmitting,
  currentStep,
  handlePrevious,
}: {
  handleCancel?: () => void;
  isSubmitting: boolean;
  currentStep: number;
  handlePrevious?: () => void;
}) => {
  return (
    <div className='flex items-center justify-between'>
      {currentStep > 0 ? (
        <button
          onClick={handlePrevious}
          className='px-4 py-1.5 text-gray-700 rounded bg-gray-100 font-medium hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer'
        >
          Previous
        </button>
      ) : (
        <button
          onClick={handleCancel}
          className='px-4 py-1.5 text-gray-700 rounded bg-gray-100 font-medium hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer'
        >
          Cancel
        </button>
      )}
      <button
        type='submit'
        className='px-4 py-1.5 bg-orange text-white rounded font-medium hover:bg-orange-light transition-colors cursor-pointer'
      >
        {isSubmitting ? (
          <span className='flex items-center justify-center gap-2'>
            <Loader2 className='w-5 h-5 animate-spin' />
            Saving...
          </span>
        ) :
          currentStep === 4 ? 'Submit' : 'Save and Next'
        }
      </button>
    </div>
  );
};

export default InstructorRegistrationFooterAction;
