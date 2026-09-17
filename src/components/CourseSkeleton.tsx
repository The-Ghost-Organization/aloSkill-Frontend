const CourseSkeleton = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className='bg-white rounded shadow-md overflow-hidden border border-gray-100 animate-pulse'
        >
          <div className='h-48 bg-gray-200' />
          <div className='p-5 space-y-4'>
            <div className='h-4 bg-gray-200 rounded w-3/4' />
            <div className='h-6 bg-gray-200 rounded' />
            <div className='h-6 bg-gray-200 rounded w-5/6' />
            <div className='flex gap-4'>
              <div className='h-4 bg-gray-200 rounded flex-1' />
              <div className='h-4 bg-gray-200 rounded flex-1' />
            </div>
            <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
              <div className='h-8 bg-gray-200 rounded-full w-24' />
              <div className='h-8 bg-gray-200 rounded w-20' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseSkeleton;
