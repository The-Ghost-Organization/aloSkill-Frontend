import "./TrustedBadge.css";
const TrustedBadge = () => {
  return (
    <div>
      {/* Trust Badges Marquee */}
      <div className='mt-16 text-center'>
        <p className='text-gray-500 mb-6'>Trusted by industry leaders</p>
        <div className='relative overflow-hidden py-8'>
          {/* Gradient Overlays */}
          <div className='absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-gray-50 to-transparent z-10'></div>
          <div className='absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-gray-50 to-transparent z-10'></div>

          {/* Marquee Container */}
          <div className='flex animate-marquee'>
            {/* First Set */}
            <div className='flex items-center gap-16 px-8 shrink-0'>
              <div className='text-3xl font-bold text-gray-400'>TECHCORP</div>
              <div className='text-3xl font-bold text-gray-400'>INNOVATE</div>
              <div className='text-3xl font-bold text-gray-400'>ENTERPRISE</div>
              <div className='text-3xl font-bold text-gray-400'>BUSINESS</div>
              <div className='text-3xl font-bold text-gray-400'>SOLUTIONS</div>
              <div className='text-3xl font-bold text-gray-400'>GLOBAL</div>
              <div className='text-3xl font-bold text-gray-400'>VENTURES</div>
              <div className='text-3xl font-bold text-gray-400'>SYSTEMS</div>
            </div>

            {/* Duplicate Set for Seamless Loop */}
            <div className='flex items-center gap-16 px-8 shrink-0'>
              <div className='text-3xl font-bold text-gray-400'>TECHCORP</div>
              <div className='text-3xl font-bold text-gray-400'>INNOVATE</div>
              <div className='text-3xl font-bold text-gray-400'>ENTERPRISE</div>
              <div className='text-3xl font-bold text-gray-400'>BUSINESS</div>
              <div className='text-3xl font-bold text-gray-400'>SOLUTIONS</div>
              <div className='text-3xl font-bold text-gray-400'>GLOBAL</div>
              <div className='text-3xl font-bold text-gray-400'>VENTURES</div>
              <div className='text-3xl font-bold text-gray-400'>SYSTEMS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustedBadge;
