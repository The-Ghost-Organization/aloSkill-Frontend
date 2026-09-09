"use client";

import { useSessionContext } from "@/app/contexts/SessionContext.tsx";
import BorderGradientButton from "@/components/buttons/BorderGradientButton.tsx";
import GradientButton from "@/components/buttons/GradientButton.tsx";
import { apiClient } from "@/lib/api/client.ts";
import { FadeIn, getFileIdFromUrl, parseCourseDescription } from "@/lib/course/utils.tsx";
import {
  Award,
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Facebook,
  FileText,
  Globe,
  Heart,
  Home,
  Linkedin,
  Loader,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Twitter,
  Users,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { courseAddToCartHandler } from "../../../../lib/course/courseHelper.ts";
import type { CourseDetailsPublic } from "../allCourses.types.ts";
import { CurriculumTab } from "./(tabs)/CurriculumTab.tsx";
import InstructorTab from "./(tabs)/InstructorTab.tsx";
import OverviewTab from "./(tabs)/OverviewTab.tsx";
import ReviewsTab from "./(tabs)/ReviewsTab.tsx";

type VideoData = {
  libraryId: string;
  token: string;
  expiresAt: number;
  videoId: string;
} | null;

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params["id"] as string;
  const [activeTab, setActiveTab] = useState("Overview");
  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => new Set());
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [course, setCourse] = useState<CourseDetailsPublic>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalVideoData, setModalVideoData] = useState<VideoData>(null);
  const [videoData, setVideoData] = useState<VideoData>(null);
  const [videoDataLoading, setVidoeDataLoading] = useState<boolean>(false);
  const { setCartUpdate } = useSessionContext();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<CourseDetailsPublic>(
          `/course/public/viewCourse/${courseId}`
        );
        // console.log("response", response);
        setCourse(response.data);
      } catch (_error) {
        // console.error("Failed to fetch popular courses", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [courseId]);

  useEffect(() => {
    setVidoeDataLoading(true);
    if (!course?.trailerUrl) {
      return;
    }
    try {
      const getVideoData = async () => {
        const getVideoFromBunny = await apiClient.post<{
          libraryId: string;
          token: string;
          videoId: string;
          expiresAt: number;
        }>("/course/get-video-url", {
          filePath: getFileIdFromUrl(course?.trailerUrl as string),
          duration: 10,
        });
        if (!getVideoFromBunny.success) {
          return;
        }
        if (getVideoFromBunny.data) {
          setVideoData(getVideoFromBunny.data);
        }
      };
      getVideoData();
    } catch (_error: unknown) {
    } finally {
      setVidoeDataLoading(false);
    }
  }, [course?.trailerUrl]);

  const getModalVideoData = async (url: string) => {
    if (!url) return;
    setIsModalOpen(true);
    const getVideoFromBunny = await apiClient.post<{
      libraryId: string;
      token: string;
      videoId: string;
      expiresAt: number;
    }>("/course/get-video-url", {
      filePath: getFileIdFromUrl(url),
      duration: 10,
    });
    if (!getVideoFromBunny.success) {
      return;
    }
    if (getVideoFromBunny.data) {
      setModalVideoData(getVideoFromBunny.data);
    }
  };

  const courseDescriptionParsed = parseCourseDescription(course?.description);

  const courseIncludes = [
    { icon: Video, label: `${course?.content.totalDuration} on-demand video` },
    { icon: FileText, label: `${course?.content.totalLessons} lectures` },
    { icon: Download, label: `${course?.content.totalFiles} downloadable resources` },
    { icon: Award, label: "Certificate of completion" },
    { icon: Globe, label: "Access on mobile and TV" },
    { icon: Clock, label: "Full lifetime access" },
  ];

  const tabs = ["Overview", "Curriculum", "Instructor", "Reviews"];
  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  };

  const getRemainingDays = (endDate: string | Date): number => {
    const now = new Date();
    const end = new Date(endDate);

    if (isNaN(end.getTime()) || end <= now) return 0;

    const diffMs = end.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const handleAddToCart = (courseId: string) => {
    courseAddToCartHandler(courseId);
    setCartUpdate?.(prev => !prev);
  };

  if (isLoading) {
    return (
      <div className='font-medium flex items-center justify-center gap-3 min-h-screen'>
        {/* <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div> */}
        <Loader className='w-10 h-10 animate-spin' /> Loading Course...
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 max-w-[1420px] mx-auto py-10'>
      {/* Breadcrumb */}
      <div className=''>
        <div className='  px-4 sm:px-6 lg:px-8 py-3 sm:py-4'>
          <FadeIn>
            <nav className='flex items-center gap-2 text-sm text-gray-600 overflow-x-auto'>
              <Link
                href='/'
                className='hover:text-orange flex flex-row gap-1 transition-colors whitespace-nowrap'
              >
                <Home className='w-4 h-4 ' />
                Home
              </Link>
              <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 shrink-0' />
              <Link
                href='/courses'
                className='hover:text-[#da7c36] transition-colors whitespace-nowrap'
              >
                All Courses
              </Link>
              <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 shrink-0' />

              <span className='text-orange whitespace-nowrap'>{course?.title}</span>
            </nav>
          </FadeIn>
        </div>
      </div>

      <div className=' px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6 sm:space-y-8'>
            {/* Course Header */}
            <FadeIn delay={100}>
              <div className='bg-white rounded-md sm:rounded-md p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200'>
                <h1 className='text-xl   font-bold text-[#074079] mb-3 sm:mb-4 leading-tight'>
                  {course?.title}
                </h1>
                <p className='text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed'>
                  {courseDescriptionParsed.objective}
                </p>

                {/* Meta Info */}
                <div className='flex flex-wrap items-center gap-3 sm:gap-6 mb-4 sm:mb-6'>
                  {/* Rating */}
                  <div className='flex items-center gap-2'>
                    <span className='text-lg sm:text-xl text-gray-700'>
                      {course?.ratingAverage}
                    </span>
                    <div className='flex items-center'>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className='w-4 h-4 sm:w-5 sm:h-5 fill-[#fc9759] text-[#fc9759]'
                        />
                      ))}
                    </div>
                    <span className=' text-sm text-gray-600'>
                      {course?.reviews.length}(reviews)
                    </span>
                  </div>

                  {/* Students */}
                  <div className='flex items-center gap-2'>
                    <Users className='w-4 h-4 sm:w-5 sm:h-5 text-gray-500' />
                    <span className=' text-sm text-gray-600'>
                      {course?.enrollmentCount} enrolled students
                    </span>
                  </div>
                </div>

                {/* Instructors */}
                <div className='flex items-center gap-3 sm:gap-4 pt-4 border-t border-gray-200'>
                  <div className='flex -space-x-2 sm:-space-x-3'>
                    {course?.courseInstructors.map(instructor => (
                      <div
                        key={instructor.instructorId}
                        className='relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white overflow-hidden hover:scale-110 transition-transform'
                      >
                        <Image
                          src={instructor.avatarUrl || "/default-avatar.png"}
                          alt={instructor.displayName}
                          fill
                          className='object-cover'
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className=' text-sm text-gray-500'>Created by</p>
                    <p className='text-sm sm:text-base font-semibold text-[#074079]'>
                      {course?.courseInstructors.map(i => i.displayName).join(", ")}
                    </p>
                  </div>
                </div>

                {/* Last Updated */}
                <div className='flex items-center gap-2 mt-3 sm:mt-4  text-sm text-gray-600'>
                  <Calendar className='w-3 h-3 sm:w-4 sm:h-4' />
                  <span>Last updated {new Date(course?.updatedAt ?? 0).toLocaleDateString()}</span>
                </div>
              </div>
            </FadeIn>

            {/* Course Preview Image - Mobile Only */}
            <div className='lg:hidden'>
              <FadeIn delay={200}>
                <div className='relative rounded-md overflow-hidden shadow-xl group'>
                  <div className='relative aspect-video'>
                    {videoDataLoading ? (
                      <div className='w-full h-full flex items-center justify-center gap-2'>
                        <Loader className='w-6 h-6 animate-spin' /> Loading Video...
                      </div>
                    ) : (
                      videoData && (
                        <iframe
                          className='w-full h-full'
                          src={`https://iframe.mediadelivery.net/embed/${videoData.libraryId}/${videoData.videoId}?token=${videoData.token}&expires=${videoData.expiresAt}&autoplay=false`}
                          allow='encrypted-media;'
                          allowFullScreen
                        />
                      )
                    )}
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Stats Cards - Mobile Optimized */}
            {/* <FadeIn delay={250}>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'>
                {course.stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className='bg-white rounded-lg sm:rounded-md p-3 sm:p-4 border border-gray-200 hover:border-[#da7c36] hover:shadow-md transition-all group'
                    >
                      <div className='flex flex-col items-center text-center gap-2'>
                        <div className='w-10 h-10  bg-gradient-to-br from-[#fc9759] to-[#da7c36] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform'>
                          <Icon className='w-5 h-5  text-white' />
                        </div>
                        <div>
                          <p className='text-sm md:text-md font-bold text-[#074079]'>
                            {stat.value}
                          </p>
                          <p className=' text-sm md:text-md text-gray-600'>{stat.label}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </FadeIn> */}

            {/* Tabs */}
            <FadeIn delay={300}>
              <div className='bg-white rounded-md sm:rounded-md shadow-sm border border-gray-200 overflow-hidden'>
                {/* Tab Headers */}
                <div className='flex border-b border-gray-200 overflow-x-auto scrollbar-hide'>
                  {tabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold  text-sm md:text-md whitespace-nowrap transition-all relative ${
                        activeTab === tab ? "text-[#da7c36]" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#d15100] to-[#da7c36]' />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className='p-4 sm:p-6 lg:p-8'>
                  {activeTab === "Overview" && <OverviewTab description={course?.description} />}
                  {activeTab === "Curriculum" && (
                    <CurriculumTab
                      curriculum={course?.modules ?? []}
                      expandedSections={expandedSections}
                      toggleSection={toggleSection}
                      totalLectures={course?.content?.totalLessons ?? 0}
                      totalDuration={course?.content?.totalDuration ?? 0}
                      getModalVideoData={getModalVideoData}
                    />
                  )}
                  {activeTab === "Instructor" && (
                    <InstructorTab instructors={course?.courseInstructors ?? []} />
                  )}
                  {activeTab === "Reviews" && (
                    <ReviewsTab
                      reviews={course?.reviews ?? []}
                      ratingAverage={course?.ratingAverage ?? 0}
                    />
                  )}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-1'>
            <FadeIn delay={400}>
              <div className='sticky top-20 lg:top-24'>
                {/* Desktop Preview Image */}
                <div className='hidden lg:block mb-6'>
                  <div className='rounded overflow-hidden shadow m-0 p-0'>
                    <div className='aspect-video'>
                      {videoDataLoading ? (
                        <div className='w-full h-full flex items-center justify-center gap-2 bg-amber-500 z-30'>
                          <Loader className='w-6 h-6 animate-spin' /> Loading Video...
                        </div>
                      ) : (
                        videoData && (
                          <iframe
                            className='w-full h-full object-fill rounded'
                            src={`https://iframe.mediadelivery.net/embed/${videoData.libraryId}/${videoData.videoId}?token=${videoData.token}&expires=${videoData.expiresAt}&autoplay=false`}
                            allow='encrypted-media;'
                            allowFullScreen
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-md sm:rounded-md shadow-lg border border-gray-200 overflow-hidden'>
                  {/* Price */}
                  <div className='p-4 sm:p-6 bg-linear-to-br from-orange-50 via-white to-purple-50'>
                    <div className='flex items-baseline gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap'>
                      {course?.discountPrice && course?.discountPrice > 0 ? (
                        <>
                          <span className='text-xl font-bold text-orange-dark'>
                            ${course?.discountPrice}
                          </span>
                          <span className='text-xl text-gray-400 line-through'>
                            ${course?.originalPrice}
                          </span>
                          <span className='px-2 py-1 bg-orange-dark  text-white rounded  font-bold'>
                            {course?.discountPercent}% OFF
                          </span>
                        </>
                      ) : (
                        <>
                          <span className='text-xl text-orange-dark font-bold'>
                            ${course?.originalPrice}
                          </span>
                        </>
                      )}
                    </div>

                    {course?.discountPrice && course?.discountPrice > 0 ? (
                      <div className='flex items-center gap-2  text-sm text-red-600 mb-3 sm:mb-4'>
                        <Clock className='w-4 h-4 shrink-0' />
                        <span className='font-semibold'>
                          {" "}
                          {getRemainingDays(course?.discountEndDate as string)} day
                          {getRemainingDays(course?.discountEndDate as string) !== 1 && "s"} left at
                          this price!
                        </span>
                      </div>
                    ) : (
                      <></>
                    )}

                    <div className='space-y-2 sm:space-y-3'>
                      {/* Add to Cart */}
                      <GradientButton
                        size='md'
                        icon={ShoppingCart}
                        iconPosition='right'
                        className='w-full'
                        onClick={() => handleAddToCart(course?.id as string)}
                      >
                        Add To Cart
                      </GradientButton>

                      {/* Buy Now */}
                      <Link href={`/checkout/${course?.id}`}>
                        <BorderGradientButton
                          className='w-full h-14 text-lg font-bold'
                          icon={CreditCard}
                        >
                          Buy Now
                        </BorderGradientButton>
                      </Link>
                    </div>

                    {/* Money-back guarantee */}
                    <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
                      <div className='flex items-center gap-2  text-sm text-green-700'>
                        <Shield className='w-4 h-4 shrink-0' />
                        <span className='font-semibold'>30-Day Money-Back Guarantee</span>
                      </div>
                    </div>
                  </div>

                  {/* This course includes */}
                  <div className='p-4 sm:p-6 border-t border-gray-200'>
                    <h3 className='font-bold text-sm sm:text-base text-[#074079] mb-3 sm:mb-4'>
                      This course includes:
                    </h3>
                    <div className='space-y-2 sm:space-y-3'>
                      {courseIncludes.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={index}
                            className='flex items-center gap-2 sm:gap-3  text-sm text-gray-700 hover:text-[#da7c36] transition-colors group'
                          >
                            <Icon className='w-4 h-4 sm:w-5 sm:h-5 text-[#da7c36] shrink-0 group-hover:scale-110 transition-transform' />
                            <span>{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className='p-4 sm:p-6 border-t border-gray-200 space-y-2 sm:space-y-3'>
                    <div className='flex items-center justify-between  text-sm'>
                      <span className='text-gray-600'>Language</span>
                      <span className='font-semibold text-[#074079]'>{course?.language}</span>
                    </div>
                    <div className='flex items-center justify-between  text-sm'>
                      <span className='text-gray-600'>Subtitle Language</span>
                      <span className='font-semibold text-[#074079]'>Multiple Language</span>
                    </div>
                    <div className='flex items-center justify-between  text-sm'>
                      <span className='text-gray-600'>Subtitle</span>
                      <span className='font-semibold text-[#074079]'>Yes</span>
                    </div>
                    <div className='flex items-center justify-between  text-sm'>
                      <span className='text-gray-600'>Level</span>
                      <span className='font-semibold text-[#074079]'>{course?.level}</span>
                    </div>
                  </div>

                  {/* Share */}
                  <div className='p-4 sm:p-6 border-t border-gray-200'>
                    <h3 className='font-bold text-sm sm:text-base text-[#074079] mb-3 sm:mb-4'>
                      Share this course:
                    </h3>
                    <div className='flex gap-2 sm:gap-3'>
                      <button className='p-2 sm:p-3 border border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all hover:scale-110 transform'>
                        <Facebook className='w-4 h-4 sm:w-5 sm:h-5' />
                      </button>
                      <button className='p-2 sm:p-3 border border-gray-300 rounded-lg hover:border-sky-500 hover:text-sky-500 hover:bg-sky-50 transition-all hover:scale-110 transform'>
                        <Twitter className='w-4 h-4 sm:w-5 sm:h-5' />
                      </button>
                      <button className='p-2 sm:p-3 border border-gray-300 rounded-lg hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50 transition-all hover:scale-110 transform'>
                        <Linkedin className='w-4 h-4 sm:w-5 sm:h-5' />
                      </button>
                      <button className='p-2 sm:p-3 border border-gray-300 rounded-lg hover:border-[#da7c36] hover:text-[#da7c36] hover:bg-orange-50 transition-all hover:scale-110 transform'>
                        <Share2 className='w-4 h-4 sm:w-5 sm:h-5' />
                      </button>
                    </div>
                  </div>

                  {/* Wishlist */}
                  <div className='p-4 sm:p-6 border-t border-gray-200'>
                    <button
                      onClick={() => setIsInWishlist(!isInWishlist)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-lg sm:rounded-md font-semibold text-sm sm:text-base transition-all hover:scale-105 transform ${
                        isInWishlist
                          ? "bg-red-50 text-red-600 border-2 border-red-600"
                          : "bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${isInWishlist ? "fill-red-600" : ""}`}
                      />
                      {isInWishlist ? "Added to Wishlist" : "Add to Wishlist"}
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* modal for course curriculumn */}
      {isModalOpen && (
        <div className='w-screen h-screen fixed top-0 left-0 z-90 bg-black/40 flex items-center justify-center'>
          <div className='w-[600px] aspect-video bg-white rounded flex items-center justify-center'>
            {!modalVideoData ? (
              <div className='flex items-center gap-3'>
                <Loader className='w-8 h-8 text-orange animate-spin' />
                <p className='text-lg text-orange'>Loading video...</p>
              </div>
            ) : (
              <div className='w-full h-full rounded relative group'>
                {modalVideoData && (
                  <iframe
                    className='w-full h-full rounded'
                    src={`https://iframe.mediadelivery.net/embed/${modalVideoData.libraryId}/${modalVideoData.videoId}?token=${modalVideoData.token}&expires=${modalVideoData.expiresAt}&autoplay=false`}
                    allow='encrypted-media;'
                    allowFullScreen
                  />
                )}
                <button
                  type='button'
                  onClick={() => {
                    setIsModalOpen(false);
                    setModalVideoData(null);
                  }}
                  className='items-center justify-center p-1 rounded-full bg-orange text-md absolute top-2 right-2 cursor-pointer hidden group-hover:flex transform transition-all duration-1000'
                >
                  <X className='font-semibold text-gray-300 text-md' />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style
        jsx
        global
      >{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
