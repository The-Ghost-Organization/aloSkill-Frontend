import { FadeIn } from "@/lib/course/utils.tsx";
import { ChevronDown, Clock, Lock, Play } from "lucide-react";
import type { CourseDetailsPublic } from "../../allCourses.types.ts";

type CurriculumTabProps = {
  curriculum: CourseDetailsPublic["modules"];
  expandedSections: Set<number>;
  toggleSection: (index: number) => void;
  totalLectures: number;
  totalDuration: number;
};

export function CurriculumTab({
  curriculum,
  expandedSections,
  toggleSection,
  totalLectures,
  totalDuration,
}: CurriculumTabProps) {
  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <h2 className='text-xl font-bold text-[#074079]'>Course Curriculum</h2>
        <div className='flex items-center gap-3 sm:gap-4  text-sm text-gray-600'>
          <span>{curriculum.length} Modules</span>
          <span>{totalLectures} Lectures</span>
          <span>{totalDuration} total</span>
        </div>
      </div>

      {/* Modules */}
      <div className='space-y-2 sm:space-y-3'>
        {curriculum.map((module, index) => (
          <FadeIn
            key={index}
            delay={index * 50}
          >
            <div className='border border-gray-200 rounded-lg sm:rounded-md overflow-hidden hover:shadow-md transition-shadow'>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(index)}
                className='w-full flex items-center justify-between p-3 sm:p-5 bg-gradient-to-r from-gray-50 to-white hover:from-orange-50 hover:to-purple-50 transition-all group'
              >
                <div className='flex items-center gap-3 sm:gap-4 flex-1 min-w-0'>
                  <div
                    className={`w-8 h-8  rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                      expandedSections.has(index)
                        ? "bg-gradient-to-br from-[#d15100] to-[#da7c36] "
                        : "bg-white border-2 border-gray-300 group-hover:border-[#da7c36]"
                    }`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                        expandedSections.has(index) ? "rotate-180 text-white" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div className='text-left min-w-0'>
                    <h3 className='font-bold text-sm sm:text-base text-[#074079] group-hover:text-[#da7c36] transition-colors truncate'>
                      {module.title}
                    </h3>
                    <p className=' text-sm text-gray-600 mt-1'>
                      {module.lessons.length} Lectures • {module.duration} minutes
                    </p>
                  </div>
                </div>
              </button>

              {/* Section Content */}
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  expandedSections.has(index) ? "max-h-[2000px]" : "max-h-0"
                }`}
              >
                <div className='p-3 sm:p-5 pt-0 space-y-1 sm:space-y-2 bg-white'>
                  {module.lessons.map((lesson: any, itemIndex: number) => (
                    <div
                      key={lesson.id}
                      className='flex items-center justify-between p-3 sm:p-4 hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 rounded-lg transition-all group cursor-pointer'
                      style={{
                        animationDelay: `${itemIndex * 50}ms`,
                        animation: expandedSections.has(itemIndex)
                          ? "slideIn 0.3s ease-out forwards"
                          : "none",
                      }}
                    >
                      <div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
                        {lesson?.contentUrl ? (
                          <Play className='w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 group-hover:scale-125 transition-transform' />
                        ) : (
                          <Lock className='w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0' />
                        )}
                        <span className=' text-sm text-gray-700 group-hover:text-gray-900 truncate'>
                          {lesson.title}
                        </span>
                        {lesson?.contentUrl && (
                          <span className='px-2 py-0.5 bg-green-100 text-green-700  font-semibold rounded whitespace-nowrap'>
                            Preview
                          </span>
                        )}
                      </div>
                      <span className=' text-sm text-gray-500 flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2'>
                        <Clock className='w-3 h-3' />
                        {lesson.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
