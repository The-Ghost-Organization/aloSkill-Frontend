"use client";

import { Loader } from "lucide-react";
import React from "react";

const CourseFooter = ({
  handleCancel,
  isSubmitting,
  currentStep,
  handlePrevious,
  setDataSaveMode,
  isParamsExisting,
  isDraft,
}: {
  handleCancel?: () => void;
  isSubmitting: boolean;
  currentStep: number;
  handlePrevious?: () => void;
  setDataSaveMode?: React.Dispatch<
    React.SetStateAction<"draft" | "publish" | "update" | "updateAndPublish">
  >;
  isParamsExisting?: boolean;
  isDraft?: boolean;
}) => {
  return (
    <div className='w-full flex items-center justify-between'>
      {currentStep > 1 ? (
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
      <div>
        {currentStep === 4 ? (
          isParamsExisting ? (
            isDraft ? (
              <div className='w-fit flex items-center gap-3'>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  onClick={() => setDataSaveMode && setDataSaveMode("update")}
                  className='px-4 py-1.5 bg-orange text-white rounded font-medium hover:bg-orange-light transition-colors cursor-pointer'
                >
                  {isSubmitting ? (
                    <span className='flex items-center justify-center gap-2'>
                      <Loader className='w-5 h-5 animate-spin' />
                      Submitting...
                    </span>
                  ) : (
                    "Update Course"
                  )}
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  onClick={() => setDataSaveMode && setDataSaveMode("updateAndPublish")}
                  className='px-4 py-1.5 bg-orange text-white rounded font-medium hover:bg-orange-light transition-colors cursor-pointer'
                >
                  {isSubmitting ? (
                    <span className='flex items-center justify-center gap-2'>
                      <Loader className='w-5 h-5 animate-spin' />
                      Submitting...
                    </span>
                  ) : (
                    "Publish Course"
                  )}
                </button>
              </div>
            ) : (
              <button
                type='submit'
                disabled={isSubmitting}
                onClick={() => setDataSaveMode && setDataSaveMode("update")}
                className='px-4 py-1.5 bg-orange text-white rounded font-medium hover:bg-orange-light transition-colors cursor-pointer'
              >
                {isSubmitting ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Loader className='w-5 h-5 animate-spin' />
                    Submitting...
                  </span>
                ) : (
                  "Update Course"
                )}
              </button>
            )
          ) : (
            <div className='w-fit flex items-center gap-3'>
              <button
                type='submit'
                disabled={isSubmitting}
                onClick={() => setDataSaveMode && setDataSaveMode("draft")}
                className='px-4 py-1.5 bg-orange text-white rounded font-medium hover:bg-orange-light transition-colors cursor-pointer'
              >
                {isSubmitting ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Loader className='w-5 h-5 animate-spin' />
                    Saving...
                  </span>
                ) : (
                  "Draft Save"
                )}
              </button>
              <button
                type='submit'
                disabled={isSubmitting}
                onClick={() => setDataSaveMode && setDataSaveMode("publish")}
                className='px-4 py-1.5 bg-orange text-white rounded font-medium hover:bg-orange-light transition-colors cursor-pointer'
              >
                {isSubmitting ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Loader className='w-5 h-5 animate-spin' />
                    Submitting...
                  </span>
                ) : (
                  "Submit for Review"
                )}
              </button>
            </div>
          )
        ) : (
          <button
            type='submit'
            disabled={isSubmitting}
            className='px-4 py-1.5 bg-orange text-white rounded font-medium hover:bg-orange-light transition-colors cursor-pointer'
          >
            {isSubmitting ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader className='w-5 h-5 animate-spin' />
                Saving...
              </span>
            ) : (
              "Save and Next"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseFooter;
