"use client";

import { useEffect, useState } from "react";

import InstructorCard from "@/app/(mainLayout)/instructors/InstructorCard";
import BorderGradientButton from "@/components/buttons/BorderGradientButton.tsx";
import GradientButton from "@/components/buttons/GradientButton.tsx";
import SectionHeader from "@/components/sections/SectionHeader.tsx";
import { apiClient } from "@/lib/api/client.ts";
import { type Instructor, type InstructorListApiResponse } from "@/types/instructor.types.ts";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function InstructorsSectionAdvanced() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [featuredInstructors, setFeaturedInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const handleAllInstructor = () => {
    setLoading(true);
    router.push("/instructors");
  };
  const handleAllCourses = () => {
    setLoading(true);
    router.push("/courses");
  };
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);

        // ✅ Fetch from homepage
        const response = await apiClient.get<InstructorListApiResponse[]>("/user/instructors/all");
        const transformInstructor = (apiData: InstructorListApiResponse): Instructor => ({
          id: apiData.id,
          name: apiData.displayName,
          image:
            apiData.avaterUrl ||
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
          roles: apiData.role || [],
          skills: apiData.skills || [],
          rating: Number(apiData.ratingAverage) || 0,
          totalCourses: apiData.totalCourses || 0,
        });
        if (response.success && response.data) {
          // take first 4
          const transformed = response.data.slice(0, 4).map(transformInstructor);

          setFeaturedInstructors(transformed);
        }
      } catch (error) {
        // console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);
  if (loading) return <div>Loading...</div>;
  return (
    <section className='py-16 md:py-24 bg-linear-to-br from-gray-50 via-white to-purple-50'>
      <div className=' mx-auto px-2'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 2xl:gap-4 items-center'>
          {/* Left Content */}

          <div className='space-y-6 lg:pr-8 order-2 lg:order-1 animate-fade-in'>
            <SectionHeader
              badge='Our Instructor'
              title='Meet Our Expert Instructors'
              subtitle=' Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris...'
            />

            <div className='flex flex-col 2xl:flex-row lg:flex-col md:flex-row gap-4 animate-slide-up'>
              <GradientButton
                onClick={handleAllInstructor}
                loading={loading}
                icon={ArrowRightIcon}
                iconPosition='right'
                iconAnimation='slide'
              >
                All Experts
              </GradientButton>
              <BorderGradientButton onClick={handleAllCourses}>Find Courses</BorderGradientButton>
            </div>
          </div>

          {/* Right - Instructors Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 2xl:gap-6 order-1 lg:order-2'>
            {featuredInstructors.map((instructor, index) => (
              <InstructorCard
                key={instructor.id}
                instructor={instructor} // ✅ Pass data as prop
                isHovered={hoveredId === instructor.id}
                onHover={() => setHoveredId(instructor.id)}
                onLeave={() => setHoveredId(null)}
                animationDelay={index * 100}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
