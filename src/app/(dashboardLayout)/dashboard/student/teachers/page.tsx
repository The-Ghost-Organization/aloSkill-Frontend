"use client";

import ComingSoon from "@/components/shared/ComingSoon";
import { MessageSquare, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const hasData = false; // Set to true when you implement the instructors fetch

export default function TeachersPage() {
  if (!hasData) return <ComingSoon pageName='My Instructors' />;

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
      {/* Example Card */}
      <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-orange-100'>
            <Image
              src='/image/avatar.png'
              alt='Teacher'
              fill
              className='object-cover'
            />
          </div>
          <div>
            <h3 className='font-bold text-gray-900 leading-tight'>Instructor Name</h3>
            <p className='text-xs text-gray-500'>Full Stack Developer</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Link
            href='/dashboard/student/message'
            className='flex-1 flex items-center justify-center gap-2 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-semibold hover:bg-orange-100'
          >
            <MessageSquare className='w-4 h-4' /> Message
          </Link>
          <button className='p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
            <User className='w-4 h-4 text-gray-400' />
          </button>
        </div>
      </div>
    </div>
  );
}
