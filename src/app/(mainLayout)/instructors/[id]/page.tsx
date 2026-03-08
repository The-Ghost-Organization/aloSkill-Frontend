"use client";
import "@/app/globals.css";
import { apiClient } from "@/lib/api/client.ts";
import {
  BookOpen,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Star,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import userFallback from "../../../../../public/images/userFallback.png";
import type { InstructorDetail } from "../../../../types/instructor.types.ts";
import { useSessionContext } from "../../../contexts/SessionContext.tsx";
import { AboutTab } from "./about.tsx";
import { CoursesTab } from "./courses.tsx";
export default function InstructorDetailsPage() {
  const params = useParams();
  const instructorId = params["id"] as string;
  const { user } = useSessionContext();
  const [activeTab, setActiveTab] = useState("about-us");
  const [instructor, setInstructor] = useState<InstructorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<InstructorDetail>(
          `/user/instructor/${instructorId}?userId=${user ? user.id : ""}`
        );
        if (response.success && response.data) {
          setInstructor(response.data);
        } else {
          setError(response.message || "Failed to fetch instructor");
        }
      } catch (_err) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (instructorId) {
      fetchInstructor();
    }
  }, [instructorId, user]);

  const tabs = [
    { id: "about-us", label: "About me" },
    { id: "courses", label: "Courses" },
    { id: "reviews", label: "Reviews" },
  ];

  // Loading State
  if (loading) {
    return (
      <div className='min-h-screen bg-linear-to-br from-orange-50 via-purple-50 to-blue-50 flex items-center justify-center'>
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
      <div className='min-h-screen bg-linear-to-br from-orange-50 via-purple-50 to-blue-50 flex items-center justify-center'>
        <div className='max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-xl'>
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
    <div className='min-h-screen bg-linear-to-br from-orange-50 via-purple-50 to-blue-50 py-16'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Profile Card */}
        <div className='bg-white rounded-lg shadow-xl p-6 sm:p-8 mb-6 animate-fade-in'>
          <div className='flex flex-col md:flex-row gap-6 items-start md:items-center'>
            {/* Profile Image */}
            <div className='relative'>
              <div className='w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[#DA7C36] shadow-lg'>
                <Image
                  width={128}
                  height={128}
                  src={instructor.avatarUrl || userFallback}
                  alt={instructor.displayName}
                  className='w-full h-full object-cover'
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
                    {instructor.displayName}
                  </h1>
                  <p className='text-gray-600 mb-3'>{instructor.skills.join(", ")}</p>

                  {/* Stats */}
                  <div className='flex flex-wrap gap-4 text-sm'>
                    {instructor.ratingAverage > 0 && (
                      <div className='flex items-center gap-1'>
                        <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                        <span className='font-semibold text-gray-700'>
                          {instructor.ratingAverage.toFixed(1)} Rating
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
                  {instructor.socialAccounts.map((social, index) => (
                    <Link
                      key={index}
                      href={social.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      title={social.platform}
                      className='w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 hover:border-[#DA7C36] hover:bg-[#DA7C36] hover:text-white transition-all duration-300 text-gray-600'
                    >
                      {social.platform === "FACEBOOK" && <Facebook className='w-4 h-4' />}
                      {social.platform === "LINKEDIN" && <Linkedin className='w-4 h-4' />}
                      {social.platform === "TWITTER" && <Twitter className='w-4 h-4' />}
                      {social.platform === "YOUTUBE" && <Youtube className='w-4 h-4' />}
                      {social.platform === "INSTAGRAM" && <Instagram className='w-4 h-4' />}
                    </Link>
                  ))}
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
        <div className='bg-white rounded-lg shadow-xl overflow-hidden animate-slide-up'>
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
              <CoursesTab
                courses={instructor.ownedCourses}
                instructorId={instructorId}
              />
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
    </div>
  );
}
