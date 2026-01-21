"use client";

import { Eye, EyeOff, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function AccountSettings() {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof showPasswords],
    }));
  };

  return (
    <div className='w-full flex flex-col gap-3'>
      {/* Account Settings Section */}
      <div className='bg-white w-full rounded p-4'>
        <div className=' flex flex-col gap-3 w-full'>
          {/* Profile Picture and Name Phone Number */}
          <div className='flex items-center gap-3'>
            <div className='flex flex-col gap-1 items-center order-2 w-[19%] bg-gray-400 rounded p-2'>
              <div className='relative'>
                <Image
                  width={150}
                  height={160}
                  src='https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop'
                  alt='Profile'
                  className='rounded w-full h-full'
                />
                <button className='absolute bottom-0 left-1/2 -translate-x-1/2 bg-gray-100/20 text-white px-2 py-1.5 text-xs flex items-center justify-center gap-2 hover:bg-gray-100/40 transition-colors w-full cursor-pointer'>
                  <Upload size={16} />
                  Upload Photo
                </button>
              </div>
              <p className='text-xs text-gray-800 text-start'>
                Image size should be under 1MB and image ratio needs to be 1:1
              </p>
            </div>
            <div className='flex-1 flex flex-col gap-4'>
              <h3 className='font-semibold text-gray-900'>Account Settings</h3>
              {/* Full Name */}
              <div className='w-full flex items-center gap-3'>
                <div className='w-full'>
                  <label className='block text-xs font-medium text-gray-700 mb-1'>Full name</label>
                  <input
                    type='text'
                    placeholder='First name'
                    className='w-full px-3 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
                  />
                </div>
                <div className='w-full'>
                  <label className='block text-xs font-medium text-gray-700 mb-1 opacity-0'>
                    Last
                  </label>
                  <input
                    type='text'
                    placeholder='Last name'
                    className='w-full px-3 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1'>Username</label>
                <input
                  type='text'
                  placeholder='Enter your username'
                  className='w-full px-3 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1'>Phone Number</label>
                <input
                  type='tel'
                  placeholder='Your Phone number'
                  className='w-full px-3 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className='block text-xs font-medium text-gray-700 mb-2'>Title</label>
            <div className='relative'>
              <input
                type='text'
                placeholder='Your title, profession or email biography'
                maxLength={50}
                className='w-full px-3 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
              />
              <span className='absolute right-3 top-2 text-xs text-gray-400'>0/50</span>
            </div>
          </div>

          {/* Biography */}
          <div>
            <label className='block text-xs font-medium text-gray-700 mb-2'>Biography</label>
            <textarea
              placeholder='Your title, profession or email biography'
              rows={4}
              className='w-full px-3 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm resize-none'
            />
          </div>

          <button className='bg-orange hover:bg-orange-light text-white px-4 py-1.5 rounded font-medium transition-colors w-fit'>
            Save Changes
          </button>
        </div>
      </div>

      {/* Social Profile Section */}
      <div className='bg-white w-full rounded p-4'>
        <h3 className='font-semibold text-gray-900 mb-4'>Social Profile</h3>

        <div className=' flex flex-col gap-4'>
          {/* Personal Website */}
          <div>
            <label className='block text-xs font-medium text-gray-700 mb-2'>Personal Website</label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pr-2 border-r border-gray-200'>
                🌐
              </span>
              <input
                type='url'
                placeholder='Personal website or portfolio url...'
                className='w-full pl-14 pr-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
              />
            </div>
          </div>

          {/* Facebook and Instagram */}
          <div className='flex items-center gap-4'>
            <div className='w-full'>
              <label className='block text-xs font-medium text-gray-700 mb-2'>Facebook</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pr-2 border-r border-gray-200'>
                  f
                </span>
                <input
                  type='text'
                  placeholder='Username'
                  className='w-full pl-10 pr-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
                />
              </div>
            </div>
            <div className='w-full'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Instagram</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pr-2 border-r border-gray-200'>
                  📷
                </span>
                <input
                  type='text'
                  placeholder='Username'
                  className='w-full pl-14 pr-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
                />
              </div>
            </div>
          </div>

          {/* Twitter and WhatsApp */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-medium text-gray-700 mb-2'>Twitter</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pr-2 border-r border-gray-200'>
                  🐦
                </span>
                <input
                  type='text'
                  placeholder='Username'
                  className='w-full pl-14 pr-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
                />
              </div>
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-700 mb-2'>Whatsapp</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pr-2 border-r border-gray-200'>
                  📱
                </span>
                <input
                  type='tel'
                  placeholder='Phone number'
                  className='w-full pl-14 pr-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
                />
              </div>
            </div>
          </div>

          {/* LinkedIn and Youtube */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-medium text-gray-700 mb-2'>LinkedIn</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pr-2 border-r border-gray-200'>
                  in
                </span>
                <input
                  type='text'
                  placeholder='Username'
                  className='w-full pl-14 pr-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
                />
              </div>
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-700 mb-2'>Youtube</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pr-2 border-r border-gray-200'>
                  ▶
                </span>
                <input
                  type='text'
                  placeholder='Username'
                  className='w-full pl-14 pr-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
                />
              </div>
            </div>
          </div>

          <button className='bg-orange hover:bg-orange-light text-white px-4 py-1.5 rounded font-medium transition-colors w-fit'>
            Save Changes
          </button>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        {/* Notifications Section */}
        <div className='bg-white rounded p-4 w-full h-full'>
          <h3 className='font-semibold text-gray-900 mb-4'>Notifications</h3>
          <div className='space-y-5'>
            {[
              "I want to know about my course",
              "I want to know who write a review on my course",
              "I want to know about my course and will soon lectures",
              "I want to know if you upload lectures of my enrolled course",
              "I want to know daily how many people visited my profile",
              "I want to know if you download my lectures which my profile",
            ].map((text, index) => (
              <label
                key={index}
                className='flex items-start gap-3 cursor-pointer group'
              >
                <input
                  type='checkbox'
                  className='mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer'
                />
                <span className='text-sm text-gray-700 group-hover:text-gray-900'>{text}</span>
              </label>
            ))}
          </div>

          <button className='bg-orange hover:bg-orange-light text-white px-4 py-1.5 rounded font-medium transition-colors mt-4'>
            Save Changes
          </button>
        </div>
        {/* Change Password Section */}
        <div className='bg-white rounded p-4 w-full h-full'>
          <h3 className='font-semibold text-gray-900 mb-4'>Change password</h3>

          <div className='space-y-4'>
            {/* Current Password */}
            <div>
              <label className='block text-xs font-medium text-gray-700 mb-2'>
                Current Password
              </label>
              <div className='relative'>
                <input
                  type={showPasswords.current ? "text" : "password"}
                  placeholder='Password'
                  className='w-full px-3 py-1.5 pr-10 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility("current")}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className='block text-xs font-medium text-gray-700 mb-2'>New Password</label>
              <div className='relative'>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  placeholder='Password'
                  className='w-full px-3 py-1.5 pr-10 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility("new")}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className='block text-xs font-medium text-gray-700 mb-2'>
                Confirm Password
              </label>
              <div className='relative'>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder='Confirm new password'
                  className='w-full px-3 py-1.5 pr-10 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm'
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility("confirm")}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className='bg-orange hover:bg-orange-light text-white px-4 py-1.5 rounded font-medium transition-colors'>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
