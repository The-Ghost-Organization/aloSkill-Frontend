interface ComingSoonProps {
  pageName: string;
}

export default function ComingSoon({ pageName }: ComingSoonProps) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-brand-light p-6'>
      <div className='max-w-2xl w-full text-center space-y-8'>
        <h2 className='text-orange-dark font-bold tracking-widest uppercase text-sm'>
          Aloskill Project
        </h2>
        <h1 className='text-4xl font-extrabold text-gray-900 tracking-tight'>
          {pageName} <span className='text-orange-dark'>.</span>
        </h1>

        <p className='text-lg text-gray-600 max-w-md mx-auto'>
          We are currently polishing the {pageName} experience. Check back soon for something
          amazing.
        </p>
        <div className='flex justify-center gap-2 py-4'>
          <div className='h-1.5 w-12 rounded-full bg-orange-dark animate-pulse' />
          <div className='h-1.5 w-12 rounded-full bg-gray-200' />
          <div className='h-1.5 w-12 rounded-full bg-gray-200' />
        </div>

        {/* Action / Notification */}
        <div className='pt-6'>
          <button className='bg-orange-dark hover:bg-[#b04400] text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-orange-dark/20 active:scale-95'>
            Notify Me When Ready
          </button>
        </div>
      </div>
    </div>
  );
}
