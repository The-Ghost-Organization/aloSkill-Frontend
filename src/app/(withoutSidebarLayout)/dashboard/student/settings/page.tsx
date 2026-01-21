"use client";

import { Eye, EyeOff, Upload } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const SettingsPage = () => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    title: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [profileImage, setProfileImage] = useState(
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
  );
  const [titleLength, setTitleLength] = useState(0);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "title") {
      if (value.length <= 60) {
        setProfileData(prev => ({ ...prev, [name]: value }));
        setTitleLength(value.length);
      }
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    alert("Profile changes saved successfully!");
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert("Please fill in all password fields!");
      return;
    }
    alert("Password changed successfully!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className='min-h-screen space-y-8'>
      {/* Account Settings Section */}
      <div className='rounded shadow overflow-hidden'>
        <div className='p-8'>
          <h3 className='font-bold text-gray-800 mb-4'>Account settings</h3>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Profile Image Section */}
            <div className='lg:col-span-1 p-7 bg-white rounded'>
              <div className='relative group rounded'>
                <Image
                  width={400}
                  height={400}
                  src={profileImage}
                  alt='Profile'
                  className='w-full aspect-square object-cover rounded shadow-md'
                />
                <label
                  htmlFor='profile-upload'
                  className='absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer'
                >
                  <div className='text-center text-white'>
                    <Upload className='w-8 h-8 mx-auto mb-2' />
                    <span className='text-sm font-medium'>Upload Photo</span>
                  </div>
                </label>
                <input
                  id='profile-upload'
                  type='file'
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='hidden'
                />
              </div>
              <p className='text-xs text-gray-500 text-center mt-3'>
                Image size should be under 4MB and image ratio needs to be 1:1
              </p>
            </div>

            {/* Form Fields Section */}
            <div className='lg:col-span-2 space-y-3'>
              {/* First Name & Last Name */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Full name</label>
                  <input
                    type='text'
                    name='firstName'
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    placeholder='First name'
                    className='w-full px-3 py-2 bg-white border-0 rounded focus:outline-none focus:ring-1 focus:ring-orange-light transition-all placeholder:text-sm'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2 opacity-0'>
                    Last name
                  </label>
                  <input
                    type='text'
                    name='lastName'
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    placeholder='Last name'
                    className='w-full px-3 py-2 bg-white border-0 rounded focus:outline-none focus:ring-1 focus:ring-orange-light transition-all placeholder:text-sm'
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Username</label>
                <input
                  type='text'
                  name='userName'
                  value={profileData.username}
                  onChange={handleProfileChange}
                  placeholder='User Name'
                  className='w-full px-3 py-2 bg-white border-0 rounded focus:outline-none focus:ring-1 focus:ring-orange-light transition-all placeholder:text-sm'
                />
              </div>

              {/* Email */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                <input
                  type='text'
                  name='email'
                  value={profileData.email}
                  onChange={handleProfileChange}
                  placeholder='Email Address'
                  className='w-full px-3 py-2 bg-white border-0 rounded focus:outline-none focus:ring-1 focus:ring-orange-light transition-all placeholder:text-sm'
                />
              </div>

              {/* Title */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Title</label>
                <div className='relative'>
                  <textarea
                    name='title'
                    value={profileData.title}
                    onChange={handleProfileChange}
                    placeholder='Your title, profession or small biography'
                    rows={3}
                    maxLength={60}
                    className='w-full px-3 py-2 bg-white border-0 rounded focus:outline-none focus:ring-1 focus:ring-orange-light transition-all resize-none placeholder:text-sm'
                  />
                  <span className='absolute bottom-3 right-3 text-xs text-gray-500'>
                    {titleLength}/60
                  </span>
                </div>
              </div>

              {/* Save Button */}
              <div>
                <button
                  onClick={handleSaveChanges}
                  className='px-3 py-2 bg-orange-dark hover:bg-orange-light text-white rounded shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5'
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className='rounded shadow overflow-hidden'>
        <div className='p-8'>
          <h3 className='font-bold text-gray-800 mb-8'>Change password</h3>

          <div className='max-w-xl space-y-5'>
            {/* Current Password */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Current Password
              </label>
              <div className='relative'>
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name='currentPassword'
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder='Password'
                  className='w-full px-3 py-2 bg-white border-0 rounded focus:outline-none focus:ring-1 focus:ring-orange-light transition-all placeholder:text-sm'
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility("current")}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors'
                >
                  {showPasswords.current ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>New Password</label>
              <div className='relative'>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name='newPassword'
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder='Password'
                  className='w-full px-3 py-2 bg-white border-0 rounded focus:outline-none focus:ring-1 focus:ring-orange-light transition-all placeholder:text-sm'
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility("new")}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors'
                >
                  {showPasswords.new ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Confirm Password
              </label>
              <div className='relative'>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name='confirmPassword'
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder='Confirm new password'
                  className='w-full px-3 py-2 bg-white border-0 rounded focus:outline-none focus:ring-1 focus:ring-orange-light transition-all placeholder:text-sm'
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility("confirm")}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors'
                >
                  {showPasswords.confirm ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Change Password Button */}
            <div>
              <button
                onClick={handleChangePassword}
                className='px-3 py-2 bg-orange-dark hover:bg-orange-light text-white rounded shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5'
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
