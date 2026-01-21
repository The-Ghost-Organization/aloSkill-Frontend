"use client";

import { PageHeading } from "@/components/shared/PageHeading.tsx";
import { apiClient } from "@/lib/api/client.ts";
import type { Instructor, InstructorListApiResponse } from "@/types/instructor.types.ts";
import { Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import InstructorCard from "./InstructorCard";
import "./instructor.css";

export default function AllInstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");

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
  // Fetch instructors on mount
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<InstructorListApiResponse[]>("/user/instructors/all");
        if (response.success && response.data) {
          const transformData = response.data.map(transformInstructor);
          setInstructors(transformData);
          setFilteredInstructors(transformData);
        } else {
          setError(response.message || "Failed to fetch instructors");
        }
      } catch (_err) {
        // console.error("Error fetching instructors:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  // Apply search filter
  useEffect(() => {
    let filtered = [...instructors];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(instructor => {
        const name = instructor.name?.toLowerCase() || "";
        const skills = instructor.skills?.join(" ").toLowerCase() || "";
        return name.includes(query) || skills.includes(query);
      });
    }

    setFilteredInstructors(filtered);
  }, [searchQuery, instructors]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
  };

  // Loading State
  if (loading) {
    return (
      <div className='min-h-screen bg-linear-to-br from-orange-50 via-purple-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-16 h-16 text-[#074079] animate-spin mx-auto mb-4' />
          <p className='text-lg text-gray-600 font-semibold'>Loading instructors...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className='min-h-screen bg-linear-to-br from-orange-50 via-purple-50 to-blue-50 flex items-center justify-center'>
        <div className='max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-xl'>
          <div className='text-6xl mb-4'>⚠️</div>
          <h2 className='text-2xl font-bold text-red-600 mb-2'>Error Loading Instructors</h2>
          <p className='text-gray-600 mb-6'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='px-6 py-3 bg-[#074079] text-white rounded-lg hover:bg-[#053052] transition-colors font-semibold'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-orange-50 via-purple-50 to-blue-50'>
      {/* Hero Section */}
      <section className='relative py-6 md:py-20 overflow-hidden'>
        <div className='absolute inset-0 bg-linear-to-r from-purple-100/50 to-pink-100/50'></div>

        <div className='relative max-w-7xl mx-auto px-4 text-center'>
          <PageHeading
            badge='Experts'
            title='Meet Our Instructors'
            subtitle='Learn from experienced professionals dedicated to your success'
          />

          {/* Stats */}
          <div className=' flex justify-center gap-8 animate-fade-in'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-[#074079]'>{instructors.length}</div>
              <div className='text-sm text-gray-600'>Total Instructors</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-[#074079]'>
                {instructors.reduce((sum, i) => sum + i.totalCourses, 0)}
              </div>
              <div className='text-sm text-gray-600'>Total Courses</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-[#074079]'>{filteredInstructors.length}</div>
              <div className='text-sm text-gray-600'>Showing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructors Grid Section */}
      {filteredInstructors.length === 0 ? (
        <section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16'>
          <div className='text-center py-16 bg-white rounded-2xl shadow-lg'>
            <Users className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Instructors Found</h3>
            <p className='text-gray-600 mb-4'>
              {searchQuery
                ? "Try adjusting your search query"
                : "No instructors available at the moment"}
            </p>
            {searchQuery && (
              <button
                onClick={resetFilters}
                className='px-6 py-3 bg-[#074079] text-white rounded-lg hover:bg-[#053052] transition-colors font-semibold'
              >
                Clear Search
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className='py-12 md:py-16'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8'>
              {filteredInstructors.map((instructor, index) => (
                <InstructorCard
                  key={instructor.id}
                  instructor={instructor}
                  isHovered={hoveredId === instructor.id}
                  onHover={() => setHoveredId(instructor.id)}
                  onLeave={() => setHoveredId(null)}
                  animationDelay={index * 100}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
