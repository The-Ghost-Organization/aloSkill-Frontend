import { FadeIn, parseCourseDescription } from "@/lib/course/utils.tsx";
import { CheckCircle2 } from "lucide-react";

function OverviewTab({ description }: { description?: string | null }) {
  const courseDescriptionParsed = parseCourseDescription(description);

  return (
    <div className='space-y-6 sm:space-y-8'>
      {/* Description */}
      <FadeIn>
        <div>
          <h2 className='text-xl font-bold text-[#074079] mb-3 sm:mb-4'>Description</h2>
          <div className='prose prose-sm max-w-none text-gray-700'>
            <p className='leading-relaxed'>
              {courseDescriptionParsed.description || "No description available for this course."}
            </p>
          </div>
        </div>
      </FadeIn>

      {/* What you'll learn */}
      <FadeIn delay={100}>
        <div className='bg-gradient-to-br from-green-50 to-emerald-50 rounded-md p-4 sm:p-6 border-2 border-green-200'>
          <h2 className='text-xl sm:text-2xl font-black text-[#074079] mb-4 flex items-center gap-3'>
            <div className='w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center'>
              <CheckCircle2 className='w-5 h-5 text-white' />
            </div>
            What you will learn
          </h2>

          <div className='grid sm:grid-cols-2 gap-3'>
            {courseDescriptionParsed.whatYouTeach.map((item, index) => (
              <div
                key={index}
                className='flex gap-2'
              >
                <CheckCircle2 className='w-4 h-4 text-green-600 mt-1' />
                <span className='text-sm text-gray-700'>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Target Audience */}
      <FadeIn delay={200}>
        <div>
          <h2 className='text-xl sm:text-2xl font-black text-[#074079] mb-4'>
            Who this course is for
          </h2>
          <ul className='space-y-2'>
            {courseDescriptionParsed.targetAudience.map((audience, index) => (
              <li
                key={index}
                className='flex gap-2'
              >
                <span className='text-[#da7c36]'>✓</span>
                <span className='text-sm text-gray-700'>{audience}</span>
              </li>
            ))}
          </ul>
        </div>
      </FadeIn>

      {/* Requirements */}
      <FadeIn delay={300}>
        <div>
          <h2 className='text-xl sm:text-2xl font-black text-[#074079] mb-4'>
            Course requirements
          </h2>
          <ul className='space-y-2'>
            {courseDescriptionParsed.requirements.map((req, index) => (
              <li
                key={index}
                className='flex gap-2'
              >
                <span className='w-2 h-2 bg-[#da7c36] rounded-full mt-2' />
                <span className='text-sm text-gray-700'>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </FadeIn>
    </div>
  );
}

export default OverviewTab;
