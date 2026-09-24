import { FadeIn } from "@/lib/course/utils.tsx";
import { ChevronDown, Clock3, ListVideo, Lock, PlayCircle } from "lucide-react";
import type { CourseDetailsPublic } from "../../allCourses.types.ts";

type CurriculumTabProps = {
  curriculum: CourseDetailsPublic["modules"];
  expandedSections: Set<number>;
  toggleSection: (index: number) => void;
  totalLectures: number;
  totalDuration: number;
  getModalVideoData: (url: string) => void;
};

const formatDuration = (seconds?: number | null) => {
  const value = Math.max(0, Number(seconds ?? 0));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return value > 0 ? "< 1m" : "0m";
};

export function CurriculumTab({
  curriculum,
  expandedSections,
  toggleSection,
  totalLectures,
  totalDuration,
  getModalVideoData,
}: CurriculumTabProps) {
  if (curriculum.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center'>
        <ListVideo className='mx-auto h-9 w-9 text-slate-400' />
        <h2 className='mt-3 font-bold text-slate-800'>Curriculum is being prepared</h2>
        <p className='mt-1 text-sm text-slate-500'>Modules and lessons will appear here when available.</p>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-orange-500'>Course content</p>
          <h2 className='mt-1 text-xl font-bold text-slate-900 sm:text-2xl'>Course curriculum</h2>
        </div>
        <div className='flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600'>
          <span className='rounded-full bg-slate-100 px-3 py-1.5'>{curriculum.length} modules</span>
          <span className='rounded-full bg-slate-100 px-3 py-1.5'>{totalLectures} lessons</span>
          <span className='rounded-full bg-slate-100 px-3 py-1.5'>{formatDuration(totalDuration)}</span>
        </div>
      </div>

      <div className='space-y-3'>
        {curriculum.map((module, moduleIndex) => {
          const isExpanded = expandedSections.has(moduleIndex);

          return (
            <FadeIn key={`${module.title}-${moduleIndex}`} delay={moduleIndex * 40}>
              <div className={`overflow-hidden rounded-2xl border transition ${isExpanded ? "border-orange-200 bg-orange-50/20" : "border-slate-200 bg-white"}`}>
                <button
                  type='button'
                  onClick={() => toggleSection(moduleIndex)}
                  className='flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5'
                >
                  <div className='flex min-w-0 items-center gap-3'>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${isExpanded ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {moduleIndex + 1}
                    </span>
                    <div className='min-w-0'>
                      <h3 className='truncate text-sm font-bold text-slate-900 sm:text-base'>{module.title}</h3>
                      <p className='mt-1 text-xs text-slate-500'>
                        {module.lessons.length} lesson{module.lessons.length === 1 ? "" : "s"} · {formatDuration(module.duration)}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180 text-orange-500" : ""}`} />
                </button>

                {isExpanded && (
                  <div className='border-t border-slate-100 bg-white px-3 py-2 sm:px-4'>
                    {module.lessons.map((lesson, lessonIndex) => {
                      const canPreview = Boolean(lesson.contentUrl);
                      return (
                        <button
                          type='button'
                          key={`${lesson.title}-${lessonIndex}`}
                          disabled={!canPreview}
                          onClick={() => lesson.contentUrl && getModalVideoData(lesson.contentUrl)}
                          className={`flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left transition ${canPreview ? "group hover:bg-orange-50" : "cursor-default"}`}
                        >
                          <div className='flex min-w-0 items-center gap-3'>
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${canPreview ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100" : "bg-slate-100 text-slate-400"}`}>
                              {canPreview ? <PlayCircle className='h-4 w-4' /> : <Lock className='h-4 w-4' />}
                            </span>
                            <div className='min-w-0'>
                              <p className='truncate text-sm font-medium text-slate-700'>{lesson.title}</p>
                              {canPreview && <span className='mt-0.5 block text-[11px] font-semibold text-emerald-600'>Preview available</span>}
                            </div>
                          </div>
                          <span className='flex shrink-0 items-center gap-1.5 text-xs text-slate-500'>
                            <Clock3 className='h-3.5 w-3.5' />
                            {formatDuration(lesson.duration)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
