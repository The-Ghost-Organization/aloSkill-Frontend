"use client";

import { useEffect, useState } from "react";

import InstructorCard from "@/app/(mainLayout)/instructors/InstructorCard";
import BorderGradientButton from "@/components/buttons/BorderGradientButton.tsx";
import GradientButton from "@/components/buttons/GradientButton.tsx";
import SectionHeader from "@/components/sections/SectionHeader.tsx";
import { apiClient } from "@/lib/api/client.ts";
import { type Instructor } from "@/types/instructor.types.ts";
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
        const response = await apiClient.get<Instructor[]>("/user/instructors/all");
        if (response.success && response.data) {
          setFeaturedInstructors(response.data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);
  if (loading) return <div>Loading...</div>;
  return (
    <section className='py-16 md:py-24 bg-linear-to-br from-gray-50 via-white to-purple-50'>
      <div className=' mx-auto px-4'>
        <div className='grid grid-cols-1 lg:grid-cols-2  gap-4 xl:gap-4 items-center'>
          {/* Left Content */}

          <div className='px-4 sm:px-6 lg:px-8 animate-fade-in'>
            <SectionHeader
              badge='Our Instructor'
              title='Meet our'
              color_title='Expert Instructors'
              subtitle='Learn from industry experts and entrepreneurs who share real-world skills you can apply immediately.'
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
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 2xl:gap-6 order-2 lg:order-2'>
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
