"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { btnPrimary, btnSecondary } from "./formUi.tsx";

type SaveMode = "draft" | "publish" | "update" | "updateAndPublish";

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
  setDataSaveMode?: React.Dispatch<React.SetStateAction<SaveMode>>;
  isParamsExisting?: boolean;
  isDraft?: boolean;
}) => {
  // Purely visual: remembers which submit button was pressed so only that
  // button shows the spinner. The save mode itself is still set via setDataSaveMode.
  const [pressed, setPressed] = useState<SaveMode | "next" | null>(null);
  useEffect(() => {
    if (!isSubmitting) setPressed(null);
  }, [isSubmitting]);

  const renderSubmit = ({
    mode,
    label,
    busyLabel,
    variant = "primary",
  }: {
    mode: SaveMode;
    label: string;
    busyLabel: string;
    variant?: "primary" | "secondary";
  }) => (
    <button
      key={mode}
      type='submit'
      disabled={isSubmitting}
      onClick={() => {
        setPressed(mode);
        if (setDataSaveMode) setDataSaveMode(mode);
      }}
      className={variant === "primary" ? btnPrimary : btnSecondary}
    >
      {isSubmitting && pressed === mode ? (
        <>
          <Loader2
            className='h-4 w-4 animate-spin'
            aria-hidden='true'
          />
          {busyLabel}
        </>
      ) : (
        label
      )}
    </button>
  );

  return (
    <div className='sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-gray-200 bg-white px-4 py-4 sm:px-8'>
      {currentStep > 1 ? (
        <button
          type='button'
          onClick={handlePrevious}
          className={btnSecondary}
        >
          <ArrowLeft
            className='h-4 w-4'
            aria-hidden='true'
          />
          Back
        </button>
      ) : handleCancel ? (
        <button
          type='button'
          onClick={handleCancel}
          className={btnSecondary}
        >
          Cancel
        </button>
      ) : (
        <span className='text-xs text-gray-400'>Step {currentStep} of 4</span>
      )}

      <div className='flex flex-wrap items-center gap-3'>
        {currentStep === 4 ? (
          isParamsExisting ? (
            isDraft ? (
              <>
                {renderSubmit({ mode: "update", label: "Save changes", busyLabel: "Saving…", variant: "secondary" })}
                {renderSubmit({ mode: "updateAndPublish", label: "Publish course", busyLabel: "Publishing…" })}
              </>
            ) : (
              renderSubmit({ mode: "update", label: "Save changes", busyLabel: "Saving…" })
            )
          ) : (
            <>
              {renderSubmit({ mode: "draft", label: "Save as draft", busyLabel: "Saving…", variant: "secondary" })}
              {renderSubmit({ mode: "publish", label: "Submit for review", busyLabel: "Submitting…" })}
            </>
          )
        ) : (
          <button
            type='submit'
            disabled={isSubmitting}
            onClick={() => setPressed("next")}
            className={btnPrimary}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className='h-4 w-4 animate-spin'
                  aria-hidden='true'
                />
                Saving…
              </>
            ) : (
              "Save & continue"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseFooter;
