"use client";

import { useState } from "react";

export default function TeachersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Courses");
  const [teacherFilter, setTeacherFilter] = useState("All Teachers");

  const courses = [
    {
      id: 1,
      name: "Wade Warren",
      expertise: "Digital Project Designer",
      ratings: 3,
      totalStudents: 500,
    },
    {
      id: 2,
      name: "Wade Warren",
      expertise: "Digital Project Designer",
      ratings: 3,
      totalStudents: 500,
    },
    {
      id: 3,
      name: "Wade Warren",
      expertise: "Digital Project Designer",
      ratings: 3,
      totalStudents: 500,
    },
    {
      id: 4,
      name: "Wade Warren",
      expertise: "Digital Project Designer",
      ratings: 3,
      totalStudents: 500,
    },
    {
      id: 5,
      name: "Wade Warren",
      expertise: "Digital Project Designer",
      ratings: 3,
      totalStudents: 500,
    },
    {
      id: 6,
      name: "Wade Warren",
      expertise: "Digital Project Designer",
      ratings: 3,
      totalStudents: 500,
    },
    {
      id: 7,
      name: "Wade Warren",
      expertise: "Digital Project Designer",
      ratings: 3,
      totalStudents: 500,
    },
    {
      id: 8,
      name: "Wade Warren",
      expertise: "Digital Project Designer",
      ratings: 3,
      totalStudents: 500,
    },
  ];

  return (
    <div className='min-h-screen max-w-7xl w-full mx-auto flex flex-col gap-5'>
      {/* Header */}
      <h3>Teachers (150)</h3>

      {/* Filters and Search */}
      <div className='w-full flex space-x-4 justify-between items-center'>
        {/* Search */}
        <div className='w-[40%] flex gap-3 bg-white rounded'>
          {/* <div className="flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div> */}
          <input
            type='text'
            className='w-full h-full px-3 py-2 rounded leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400'
            placeholder='📑 Search in your courses...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sort and Filter Controls */}
        <div className='w-[60%] flex gap-4 items-center'>
          {/* Sort by */}
          <select className='w-full px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white'>
            <option>Latest</option>
            <option>Oldest</option>
            <option>Alphabetical</option>
          </select>

          {/* Status filter */}
          <select
            className='w-full px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white'
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option>All Courses</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Not Started</option>
          </select>

          {/* Teacher filter */}
          <select
            className='w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white'
            value={teacherFilter}
            onChange={e => setTeacherFilter(e.target.value)}
          >
            <option>All Teachers</option>
            <option>Specific Teacher</option>
          </select>
        </div>
      </div>

      {/* Courses List */}
      <div className='w-full shadow grid grid-cols-4 gap-4'>
        {courses.map(course => (
          <div
            key={course.id}
            className='w-full h-[400px] flex flex-col gap-2 bg-white rounded'
          >
            <div className='w-full h-[60%] border border-gray-300'>this is an image section</div>
            <div className='w-full h-[40%] flex flex-col items-center gap-2 px-2 pb-2'>
              <h4 className='text-lg font-semibold text-gray-900'>{course.name}</h4>
              <p className='text-gray-600 text-sm'>{course.expertise}</p>
              <hr className='h-1 w-full' />
              <div className='w-full flex items-center justify-between text-sm'>
                <span>⭐ {course.ratings}</span>
                <span>{course.totalStudents} Students</span>
              </div>
              <div className='flex-1 w-full flex items-end'>
                <button className='w-full flex items-center justify-center px-3 py-1 rounded bg-orange-light text-orange-dark'>
                  Send Message
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
