import { FadeIn, parseCourseDescription } from "@/lib/course/utils.tsx";
import { Check, CheckCircle2, CircleDot, Target, UsersRound } from "lucide-react";

function OverviewTab({ description }: { description?: string | null }) {
  const parsed = parseCourseDescription(description);
  const learningItems = parsed.whatYouTeach.filter(Boolean);
  const audienceItems = parsed.targetAudience.filter(Boolean);
  const requirementItems = parsed.requirements.filter(Boolean);

  return (
    <div className='space-y-8'>
      <FadeIn>
        <section>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#074079]'>
              <Target className='h-4 w-4' />
            </div>
            <h2 className='text-xl font-bold text-slate-900'>About this course</h2>
          </div>
          <p className='max-w-4xl whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-[15px]'>
            {parsed.description || "No detailed course description is available yet."}
          </p>
        </section>
      </FadeIn>

      {learningItems.length > 0 && (
        <FadeIn delay={80}>
          <section className='rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 sm:p-6'>
            <div className='mb-5 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white'>
                <CheckCircle2 className='h-5 w-5' />
              </div>
              <div>
                <h2 className='text-lg font-bold text-slate-900 sm:text-xl'>What you will learn</h2>
                <p className='mt-0.5 text-xs text-slate-500'>Skills and outcomes covered in this course</p>
              </div>
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              {learningItems.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className='flex gap-3 rounded-xl border border-emerald-100 bg-white/80 p-3.5'
                >
                  <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700'>
                    <Check className='h-3 w-3' />
                  </span>
                  <span className='text-sm leading-6 text-slate-700'>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      <div className='grid gap-6 md:grid-cols-2'>
        {audienceItems.length > 0 && (
          <FadeIn delay={140}>
            <section className='h-full rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600'>
                  <UsersRound className='h-4 w-4' />
                </div>
                <h2 className='text-lg font-bold text-slate-900'>Who this course is for</h2>
              </div>
              <ul className='space-y-3'>
                {audienceItems.map((audience, index) => (
                  <li key={`${audience}-${index}`} className='flex gap-3 text-sm leading-6 text-slate-600'>
                    <CheckCircle2 className='mt-1 h-4 w-4 shrink-0 text-orange-500' />
                    <span>{audience}</span>
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>
        )}

        {requirementItems.length > 0 && (
          <FadeIn delay={180}>
            <section className='h-full rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#074079]'>
                  <CircleDot className='h-4 w-4' />
                </div>
                <h2 className='text-lg font-bold text-slate-900'>Requirements</h2>
              </div>
              <ul className='space-y-3'>
                {requirementItems.map((item, index) => (
                  <li key={`${item}-${index}`} className='flex gap-3 text-sm leading-6 text-slate-600'>
                    <span className='mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#074079]' />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>
        )}
      </div>
    </div>
  );
}

export default OverviewTab;
