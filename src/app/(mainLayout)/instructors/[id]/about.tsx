import type { InstructorDetail } from "../../../../types/instructor.types.ts";

export function AboutTab({ instructor }: { instructor: InstructorDetail }) {
  return (
    <div className='space-y-6 animate-fade-in-content'>
      <div>
        <h3 className='text-lg font-bold text-[#074079] mb-4'>About {instructor.displayName}</h3>
        <p className='text-gray-600 leading-relaxed mb-4'>{instructor.bio}</p>
      </div>

      <div>
        <h3 className='text-lg font-bold text-[#074079] mb-4'>Expertise:</h3>
        <p className='text-gray-600 leading-relaxed'>{instructor.skills.join(", ")}</p>
      </div>

      <div>
        <h3 className='text-lg font-bold text-[#074079] mb-4'>Skills:</h3>
        <div className='flex flex-wrap gap-2'>
          {instructor.skills.map((skill, index) => (
            <div
              key={index}
              className='inline-block bg-linear-to-r from-orange-50 to-purple-50 text-[#074079] px-4 py-2 rounded-lg hover:shadow-md transition-shadow duration-300'
            >
              {skill}
            </div>
          ))}
        </div>
      </div>

      {instructor.website && (
        <div>
          <h3 className='text-lg font-bold text-[#074079] mb-4'>Website:</h3>
          <a
            href={instructor.website}
            target='_blank'
            rel='noopener noreferrer'
            className='text-[#DA7C36] hover:text-[#d15100] underline'
          >
            {instructor.website}
          </a>
        </div>
      )}
    </div>
  );
}
