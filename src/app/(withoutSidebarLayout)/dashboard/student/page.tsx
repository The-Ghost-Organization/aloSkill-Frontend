"use client";

import Image from "next/image";
import { useState } from "react";

export default function DashboardPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const courses = [
    {
      id: 1,
      image: "/api/placeholder/400/300",
      title: "Roiki Level I, II and Master/Teacher Program",
      subtitle: "1. Intorductions",
      progress: 0,
    },
    {
      id: 2,
      image: "/api/placeholder/400/300",
      title: "The Complete 2021 Web Development Bootcamp",
      subtitle: "167. What You'll Need to Get Started - Se...",
      progress: 61,
    },
    {
      id: 3,
      image: "/api/placeholder/400/300",
      title: "Copywriting - Become a Freelance Copywriter...",
      subtitle: "1. How to get started with figma",
      progress: 0,
    },
    {
      id: 4,
      image: "/api/placeholder/400/300",
      title: "2021 Complete Python Bootcamp From Zero to...",
      subtitle: "9. Advanced CSS - Selector Priority",
      progress: 12,
    },
  ];

  const stats = [
    {
      icon: "🕐",
      value: "957",
      label: "Enrolled Courses",
      bgColor: "bg-orange-100",
    },
    {
      icon: "📚",
      value: "6",
      label: "Active Courses",
      bgColor: "bg-blue-200",
    },
    {
      icon: "✓",
      value: "951",
      label: "Completed Courses",
      bgColor: "bg-green-200",
    },
    {
      icon: "👥",
      value: "241",
      label: "Course Instructors",
      bgColor: "bg-orange-200",
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg p-6`}
          >
            <div className='flex items-center gap-4'>
              <div className='text-3xl'>{stat.icon}</div>
              <div>
                <div className='text-3xl font-bold text-gray-900'>{stat.value}</div>
                <div className='text-sm text-gray-600'>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Section */}
      <div>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xl font-semibold text-gray-900'>Let &apos;s start learning, Kevin</h3>
          <div className='flex gap-2'>
            <button className='w-10 h-10 rounded-lg border border-orange-300 text-orange-500'>
              ←
            </button>
            <button className='w-10 h-10 rounded-lg border border-orange-300 text-orange-500'>
              →
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {courses.map(course => (
            <div
              key={course.id}
              className='bg-white rounded-lg shadow-sm overflow-hidden'
            >
              <Image
                width={400}
                height={300}
                src={course.image}
                alt={course.title}
                className='w-full h-48 object-cover'
              />
              <div className='p-4'>
                <p className='text-xs text-gray-500 mb-1'>{course.title}</p>
                <h4 className='font-medium text-gray-900 mb-3 text-sm'>{course.subtitle}</h4>
                <div className='flex items-center justify-between'>
                  <button className='px-4 py-2 rounded-lg bg-orange-50 text-orange-500 text-sm font-medium'>
                    Watch Lecture
                  </button>
                  {course.progress > 0 && (
                    <span className='text-green-600 font-medium text-sm'>
                      {course.progress}% Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
