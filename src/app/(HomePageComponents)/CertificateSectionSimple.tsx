"use client";

import { Award, Trophy } from "lucide-react";

export function CertificateSectionSimple() {
  return (
    <section className='bg-gradient-to-br from-gray-50 to-white py-16 md:py-24'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          {/* Left - Certificate Preview */}
          <div className='order-2 lg:order-1'>
            <div className='relative bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-4 border-gray-100 hover:border-[var(--color-orange)]/20 transition-all duration-300'>
              {/* Simple Certificate Design */}
              <div className='text-center space-y-4'>
                {/* Badge */}
                <div className='flex justify-center mb-6'>
                  <div className='w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg'>
                    <Award className='w-8 h-8 text-white' />
                  </div>
                </div>

                {/* Certificate Text */}
                <h3 className='font-bold text-gray-900'>Willie Smith</h3>
                <p className='text-sm text-gray-600'>has successfully completed</p>
                <h4 className='font-bold text-gray-900 text-xl py-2'>Leadership and Motivation</h4>
                <p className='text-xs text-gray-500 max-w-md mx-auto'>
                  Certificate awarded in recognition of effort and accomplishment
                </p>

                {/* Signatures */}
                <div className='grid grid-cols-2 gap-6 pt-8 mt-8 border-t border-gray-200'>
                  <div>
                    <p className='font-semibold text-sm'>Athena Rodriguez</p>
                    <p className='text-xs text-gray-500'>Super Advisor</p>
                  </div>
                  <div>
                    <p className='font-semibold text-sm'>James Braddock</p>
                    <p className='text-xs text-gray-500'>Senior Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className='order-1 lg:order-2 space-y-6'>
            <div>
              <h2 className='text-gray-900 font-black mb-4'>
                Get Certified for Every Skill You Learn
              </h2>
              <p className='text-gray-600 leading-relaxed'>
                Earn a verified digital certificate after completing courses — showcase your
                achievement on your resume or LinkedIn profile.
              </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-4'>
              <button className='px-6 py-3 bg-[var(--color-orange)] text-white rounded-full hover:bg-[var(--color-orange-dark)] transition-all duration-300 shadow-lg font-semibold'>
                Take a Test
              </button>
              <button className='px-6 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-full hover:border-[var(--color-orange)] transition-all duration-300 font-semibold'>
                Join a Competition
              </button>
            </div>
            {/* Features */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4'>
              <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-[var(--color-orange)]/5 transition-colors'>
                <div className='w-10 h-10 bg-[var(--color-orange)]/10 rounded-full flex items-center justify-center flex-shrink-0'>
                  <Award className='w-5 h-5 text-[var(--color-orange)]' />
                </div>
                <div>
                  <h5 className='font-semibold text-gray-900 mb-1'>Verified Certificates</h5>
                  <p className='text-sm text-gray-600'>Industry-recognized credentials</p>
                </div>
              </div>
              <div className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-[var(--color-orange)]/5 transition-colors'>
                <div className='w-10 h-10 bg-[var(--color-orange)]/10 rounded-full flex items-center justify-center flex-shrink-0'>
                  <Trophy className='w-5 h-5 text-[var(--color-orange)]' />
                </div>
                <div>
                  <h5 className='font-semibold text-gray-900 mb-1'>Shareable Badges</h5>
                  <p className='text-sm text-gray-600'>Show off your achievements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
