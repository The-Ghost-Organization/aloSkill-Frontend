"use client";

import {
  BookOpen,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  Star,
  Twitter,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api/client.ts";
import type {
  InstructorDetail,
  InstructorDetailApiResponse,
} from "../../../../types/instructor.types.ts";
import { AboutTab } from "./about.tsx";

export default function InstructorDetailsPage() {
  const params = useParams();
  const instructorId = params["id"] as string;

  const [activeTab, setActiveTab] = useState("about-us");
  const [instructor, setInstructor] = useState<InstructorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformInstructorDetail = (apiData: InstructorDetailApiResponse): InstructorDetail => {
    const getSocialLink = (platform: string) => {
      return apiData.socialAccounts?.find(s => s.platform.toLowerCase() === platform.toLowerCase())
        ?.url;
    };

    return {
      id: apiData.userId,
      name: apiData.displayName,
      image:
        apiData.avatarUrl ||
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      bio: apiData.bio,
      expertise: apiData.expertise || "Instructor",
      website: apiData.website,
      rating: Number(apiData.ratingAverage) || 0,
      totalCourses: apiData.totalCourses,
      totalStudents: apiData.totalStudents,
      skills: apiData.skills || [],
      socialLinks: {
        facebook: getSocialLink("facebook"),
        twitter: getSocialLink("twitter"),
        instagram: getSocialLink("instagram"),
        linkedin: getSocialLink("linkedin"),
        youtube: getSocialLink("youtube"),
      },
      courses: apiData.ownedCourses.map(course => ({
        id: course.id,
        title: course.title,
        image: course.thumbnailUrl || "/default-course.jpg",
        originalPrice: Number(course.originalPrice),
        discountPrice: course.discountPrice ? Number(course.discountPrice) : null,
        discountEndDate: course.discountEndDate,
        rating: course.ratingAverage ? Number(course.ratingAverage) : null,
        students: course.enrollmentCount,
        lessons: course.totalLessonCount,
        duration: course.totalCourseDuration,
        reviews: course.reviews.map(review => ({
          userId: review.userId,
          createdAt: new Date(review.createdAt),
          title: review.title,
          courseId: review.courseId,
          rating: review.rating,
        })),
      })),
    };
  };
  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<InstructorDetailApiResponse>(
          `/user/instructor/${instructorId}`
        );

        if (response.success && response.data) {
          const transformed = transformInstructorDetail(response.data);
          setInstructor(transformed);
        } else {
          setError(response.message || "Failed to fetch instructor");
        }
      } catch (_err) {
        // console.error("Error fetching instructor:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (instructorId) {
      fetchInstructor();
    }
  }, [instructorId]);

  const tabs = [
    { id: "about-us", label: "About me" },
    { id: "courses", label: "Courses" },
    { id: "reviews", label: "Reviews" },
  ];

  // Loading State
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-16 h-16 text-[#074079] animate-spin mx-auto mb-4' />
          <p className='text-lg text-gray-600 font-semibold'>Loading instructor details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !instructor) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50 flex items-center justify-center'>
        <div className='max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-xl'>
          <div className='text-6xl mb-4'>⚠️</div>
          <h2 className='text-2xl font-bold text-red-600 mb-2'>Instructor Not Found</h2>
          <p className='text-gray-600 mb-6'>{error || "This instructor does not exist"}</p>
          <Link
            href='/instructors'
            className='inline-block px-6 py-3 bg-[#074079] text-white rounded-lg hover:bg-[#053052] transition-colors font-semibold'
          >
            Back to Instructors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Profile Card */}
        <div className='bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-6 animate-fade-in'>
          <div className='flex flex-col md:flex-row gap-6 items-start md:items-center'>
            {/* Profile Image */}
            <div className='relative'>
              <div className='w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[#DA7C36] shadow-lg'>
                <Image
                  width={128}
                  height={128}
                  src={instructor.image}
                  alt={instructor.name}
                  className='w-full h-full object-cover'
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80";
                  }}
                />
              </div>
              {/* {instructor.status === "approved" && (
                <div className='absolute -bottom-2 -right-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold'>
                  ✓ Verified
                </div>
              )}
              {!instructor.status && (
                <div className='absolute -bottom-2 -right-2 bg-orange-100 text-[#DA7C36] px-3 py-1 rounded-full text-xs font-bold'>
                  Instructor
                </div>
              )} */}
            </div>

            {/* Profile Info */}
            <div className='flex-1'>
              <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4'>
                <div>
                  <h1 className='text-2xl sm:text-3xl font-bold text-[#074079] mb-1'>
                    {instructor.name}
                  </h1>
                  <p className='text-gray-600 mb-3'>{instructor.skills.join(", ")}</p>

                  {/* Stats */}
                  <div className='flex flex-wrap gap-4 text-sm'>
                    {instructor.rating > 0 && (
                      <div className='flex items-center gap-1'>
                        <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                        <span className='font-semibold text-gray-700'>
                          {instructor.rating.toFixed(1)} Rating
                        </span>
                      </div>
                    )}
                    <div className='flex items-center gap-1'>
                      <Users className='w-4 h-4 text-[#DA7C36]' />
                      <span className='font-semibold text-gray-700'>
                        {instructor.totalStudents.toLocaleString()} Students
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <BookOpen className='w-4 h-4 text-[#074079]' />
                      <span className='font-semibold text-gray-700'>
                        {instructor.totalCourses.toLocaleString()} Courses
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className='flex gap-2'>
                  {[
                    { icon: Facebook, link: instructor.socialLinks.facebook, name: "Facebook" },
                    { icon: Twitter, link: instructor.socialLinks.twitter, name: "Twitter" },
                    { icon: Instagram, link: instructor.socialLinks.instagram, name: "Instagram" },
                    { icon: Linkedin, link: instructor.socialLinks.linkedin, name: "LinkedIn" },
                    { icon: Globe, link: instructor.website, name: "Website" },
                  ].map((social, index) =>
                    social.link && social.link !== "#" ? (
                      <a
                        key={index}
                        href={social.link}
                        target='_blank'
                        rel='noopener noreferrer'
                        title={social.name}
                        className='w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 hover:border-[#DA7C36] hover:bg-[#DA7C36] hover:text-white transition-all duration-300 text-gray-600'
                      >
                        <social.icon className='w-4 h-4' />
                      </a>
                    ) : null
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className='flex flex-wrap gap-4 text-sm'>
                {/* {instructor.email && (
                  <a
                    href={`mailto:${instructor.email}`}
                    className='inline-flex items-center gap-2 text-[#DA7C36] hover:text-[#d15100] transition-colors duration-200'
                  >
                    <Globe className='w-4 h-4' />
                    <span className='font-medium'>{instructor.email}</span>
                  </a>
                )} */}

                {/* {instructor.phoneNumber && (
                  <div className='flex items-center gap-2 text-gray-600'>
                    <span>📞</span>
                    <span>{instructor.phoneNumber}</span>
                  </div>
                )} */}

                {/* {instructor.location && (
                  <div className='flex items-center gap-2 text-gray-600'>
                    <span>📍</span>
                    <span>{instructor.location}</span>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='bg-white rounded-3xl shadow-xl overflow-hidden animate-slide-up'>
          {/* Tab Headers */}
          <div className='border-b border-gray-200'>
            <div className='flex'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm sm:text-base font-semibold transition-all duration-300 relative ${
                    activeTab === tab.id ? "text-[#DA7C36]" : "text-gray-600 hover:text-[#074079]"
                  }`}
                >
                  {tab.label}
                  {tab.id === "courses" && instructor.totalCourses > 0 && (
                    <span className='ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full'>
                      {instructor.totalCourses}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <div className='absolute bottom-0 left-0 right-0 h-1 bg-[#DA7C36] animate-expand'></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className='p-6 sm:p-8'>
            {activeTab === "about-us" && <AboutTab instructor={instructor} />}
            {activeTab === "courses" && (
              <div className='text-center py-12'>
                <BookOpen className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Courses Yet</h3>
                <p className='text-gray-500'>This instructor hasnt published any courses yet.</p>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className='text-center py-12'>
                <Star className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Reviews Yet</h3>
                <p className='text-gray-500'>Be the first to review this instructor!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes expand {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.2s both;
        }
        .animate-expand {
          animation: expand 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
