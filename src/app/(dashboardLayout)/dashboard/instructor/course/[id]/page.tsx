"use client";

import type { CourseDetails } from "@/app/(withoutSidebarLayout)/courses/allCourses.types.ts";
import { apiClient } from "@/lib/api/client";
import { Award, BarChart2, Eye, Globe, Heart, Play, Star, Users } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const CourseDetailPage = () => {
  const [apiError, setApiError] = useState<string>("");
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const getCourseData = async () => {
      try {
        setApiError("");

        const response = await apiClient.get<CourseDetails>(`/course/course/${id}`);
        // console.log("response: ", response);
        if (!response.success || !response.data) {
          setApiError(response.message || "Something went wrong!");
          return;
        }

        setCourseDetails(response.data);
      } catch (error) {
        setApiError(error instanceof Error ? error.message : "Something went wrong!");
      }
    };

    if (id) getCourseData();
  }, [id]);

  if (apiError) {
    return <p className='text-red-500'> this is apiERROR : {apiError}</p>;
  }

  if (!courseDetails) {
    return <p>Loading...</p>;
  }
  // Course Stats Data
  const stats = [
    {
      icon: Play,
      value: courseDetails.enrollmentCount,
      label: "Students Enrolled",
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      icon: BarChart2,
      value: courseDetails.content.totalVideos,
      label: "Total Video",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      icon: Users,
      value: courseDetails.enrolledLastWeek,
      label: "Enrolled Last Week",
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      icon: Award,
      value: courseDetails.level,
      label: "Skill level",
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      icon: Globe,
      value: courseDetails.language,
      label: "Language",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-700",
    },
    {
      icon: Award,
      value: courseDetails.content.totalFiles,
      label: "Total File Size",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      icon: Heart,
      value: courseDetails.content.totalDuration,
      label: "Time",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      icon: Eye,
      value: courseDetails.views,
      label: "View",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-700",
    },
  ];
  // console.log("course details", courseDetails);
  // console.log(courseDetails.thumbnailUrl);
  return (
    <div className='min-h-screen'>
      {/* Breadcrumb Navigation */}
      <div className='flex items-center text-sm text-gray-500 space-x-2 mb-4'>
        <span className='hover:text-gray-700 cursor-pointer'>All Courses</span>
        <span>/</span>
        <span className='hover:text-gray-700 cursor-pointer'>{courseDetails.category}</span>
        <span>/</span>
        <span className='text-gray-900 font-medium'>{courseDetails.title}</span>
      </div>

      <div className='w-full flex flex-col gap-4'>
        {/* Course Header Section */}
        <div className='bg-white rounded p-3'>
          <div className='flex gap-6 items-center'>
            {/* Course Thumbnail */}
            <div className='shrink-0'>
              <Image
                src={
                  courseDetails.thumbnailUrl
                    ? encodeURI(courseDetails.thumbnailUrl)
                    : "/images/course-placeholder.png"
                }
                alt={courseDetails.title}
                width={400}
                height={225}
                className='h-full object-cover rounded'
              />
            </div>

            {/* Course Info */}
            <div className='flex-1 flex flex-col gap-2'>
              {/* Course Creation info */}
              <div className='flex items-center gap-6'>
                <span className='text-xs text-gray-500'>
                  Uploaded On: {new Date(courseDetails.createdAt).toLocaleDateString()}
                </span>
                <span className='text-xs text-gray-500'>
                  Updated On: {new Date(courseDetails.updatedAt).toLocaleDateString()}
                </span>
              </div>
              {/* Title */}
              <h4 className='font-bold text-gray-900'>{courseDetails.title}</h4>
              {/* Instructor Info */}
              <div className='w-full flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Image
                    width={80}
                    height={80}
                    src={courseDetails.createdBy?.avatarUrl || "/images/instructor-placeholder.png"}
                    alt='Instructor'
                    className='w-10 h-10 rounded-full'
                  />
                  <div>
                    <p className='text-sm font-medium text-gray-900'>
                      {courseDetails.createdBy.displayName}
                    </p>
                    <p className='text-xs text-gray-500'>
                      Primary Instructor • {courseDetails.totalWishListed} Wishlist
                    </p>
                  </div>
                </div>

                {/* Rating Summary */}
                <div className='flex items-center space-x-2'>
                  <div className='flex items-center'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className='w-4 h-4 text-orange-400 fill-current'
                      />
                    ))}
                  </div>
                  <span className='text-sm font-semibold text-gray-900'>
                    {courseDetails.ratingAverage}
                  </span>
                  <span className='text-sm text-gray-500'>
                    ({courseDetails.ratingCount} Rating)
                  </span>
                </div>
              </div>

              {/* Price and Actions */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='flex items-center gap-2'>
                    {courseDetails.isDiscountActive && (
                      <>
                        <span className='text-xl font-bold text-orange-light'>
                          BDT {courseDetails.discountPrice}
                        </span>
                      </>
                    )}
                    <span
                      className={`text-lg text-gray-600 ${courseDetails.isDiscountActive && "line-through"}`}
                    >
                      BDT {courseDetails.originalPrice}
                    </span>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  {courseDetails.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className='px-2 py-1 bg-gray-200 text-sm text-gray-900 rounded'
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course States */}
        <div className='w-full h-[380px] flex gap-4 items-center'>
          {/* States card */}
          <div className='rounded w-full h-full flex flex-wrap gap-4'>
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className='bg-white rounded p-2 flex items-center gap-3 w-[48%]'
              >
                <div className='flex items-center justify-between'>
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div>
                  <div className='text-xl font-bold text-gray-800'>{stat.value}</div>
                  <div className='text-sm text-gray-500'>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Course Rating Distribution */}
          <div className='bg-white rounded w-full h-full'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h4 className='font-semibold'>Overall Course Ratings</h4>
              <a
                href='#'
                className='text-sm text-orange-500 hover:text-orange-600'
              >
                See more →
              </a>
            </div>
            <div>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2 px-4 py-3 border-b border-gray-200'>
                  <div className='flex flex-col gap-1 items-center justify-center bg-[#FFF2E5] w-[40%] aspect-square rounded'>
                    <div className='text-3xl font-bold text-gray-800'>
                      {courseDetails.ratingAverage}
                    </div>
                    <div className='flex items-center justify-center'>
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className='w-4 h-4 text-orange-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                        </svg>
                      ))}
                    </div>
                    <div className='text-sm text-gray-500'>Course Rating</div>
                  </div>
                  <svg
                    viewBox='0 0 200 80'
                    className='w-full h-23'
                  >
                    <polyline
                      points='0,60 20,45 40,50 60,35 80,40 100,30 120,45 140,35 160,50 180,40 200,45'
                      fill='none'
                      stroke='#fb923c'
                      strokeWidth='2'
                    />
                  </svg>
                </div>
                <div className='flex flex-col gap-2 p-4 pt-0'>
                  {courseDetails.ratingBreakdown.map((stars, idx) => (
                    <div
                      key={idx}
                      className='flex items-center space-x-3'
                    >
                      <div className='flex'>
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < stars.star ? "text-orange-400" : "text-gray-300"}`}
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                          </svg>
                        ))}
                      </div>
                      <div className='flex-1 h-2 bg-orange-400 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-green-400 rounded-full'
                          style={{ width: `${stars.percentage}` }}
                        ></div>
                      </div>
                      <span className='text-sm text-gray-600 w-10 text-right'>
                        {stars.percentage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Reviews & Overview */}
        <div className='w-full h-[380px] flex gap-4 items-center'>
          {/* Reviews Section */}
          <div className='bg-white rounded w-[45%] h-full overflow-y-auto'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h4 className='font-semibold'>Reviews</h4>
              <a
                href='#'
                className='text-sm text-orange-500 hover:text-orange-600'
              >
                See more →
              </a>
            </div>

            {courseDetails.reviews && courseDetails.reviews.length > 0 ? (
              <div className='flex flex-col divide-y divide-gray-200'>
                {courseDetails.reviews.map((review, idx) => (
                  <div
                    key={idx}
                    className='flex gap-3 p-4'
                  >
                    {/* Avatar */}
                    <Image
                      width={48}
                      height={48}
                      src={review.avatarUrl || "/images/user-placeholder.png"}
                      alt={review.userDisplayName || "User"}
                      className='w-12 h-12 rounded-full object-cover'
                    />

                    <div className='flex-1 flex flex-col gap-1'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-semibold text-gray-900'>
                          {review.userDisplayName || "Anonymous"}
                        </p>
                        <span className='text-xs text-gray-500'>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Rating Stars */}
                      <div className='flex items-center gap-1'>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "text-orange-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Review Body */}
                      {review.body && <p className='text-sm text-gray-700 mt-1'>{review.body}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='p-4 text-gray-500'>No reviews yet.</p>
            )}
          </div>

          {/* Course Overview */}
          <div className='bg-white rounded w-[55%] h-full overflow-y-auto'>
            <div className='flex items-center justify-between border-b border-gray-200 p-4'>
              <h4 className='font-semibold'>Course Overview</h4>
              <a
                href='#'
                className='text-sm text-orange-500 hover:text-orange-600'
              >
                Today →
              </a>
            </div>
            <div className='p-4 text-gray-700'>
              {courseDetails.objective || "No overview available."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
