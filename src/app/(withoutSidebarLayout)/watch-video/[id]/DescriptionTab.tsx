import type { PrivateLesson } from '../../courses/allCourses.types';

export default function DescriptionTab({content}: {content: PrivateLesson | null}) {
  return (
    <div className="prose max-w-none">
      <h3 className='text-gray-700 font-semibold text-lg mb-3'>Lecture Description</h3>
      <p className="text-gray-600">{content?.description || 'No description available for this lecture.'}</p>
    </div>
  );
}
