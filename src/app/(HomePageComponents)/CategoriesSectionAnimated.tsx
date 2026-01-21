"use client";

import BorderGradientButton from "@/components/buttons/BorderGradientButton.tsx";
import SectionMiddleHeader from "@/components/sections/SectionMiddleHeader.tsx";
import {
  ArrowRight,
  Briefcase,
  Camera,
  Code,
  GraduationCap,
  Heart,
  Laptop,
  Music,
  Palette,
} from "lucide-react";
import { useState } from "react";

const categoriesData = [
  {
    id: 1,
    icon: Code,
    title: "Development",
    subtitle: "Code with Confident",
    bgColor: "bg-yellow-50",
    iconColor: "text-purple-600",
    courses: 120,
  },
  {
    id: 2,
    icon: Palette,
    title: "UI/UX Design",
    subtitle: "Design with Confident",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-500",
    courses: 85,
  },
  {
    id: 3,
    icon: Heart,
    title: "Lifestyle",
    subtitle: "New Skills, New You",
    bgColor: "bg-orange-50",
    iconColor: "text-purple-500",
    courses: 95,
  },
  {
    id: 4,
    icon: Briefcase,
    title: "Business",
    subtitle: "Improve your business",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-500",
    courses: 110,
  },
  {
    id: 5,
    icon: Camera,
    title: "Photography",
    subtitle: "Major or Minor",
    bgColor: "bg-pink-50",
    iconColor: "text-pink-500",
    courses: 65,
  },
  {
    id: 6,
    icon: Music,
    title: "Music",
    subtitle: "Control your Wallet",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    courses: 45,
  },
  {
    id: 7,
    icon: GraduationCap,
    title: "Teaching",
    subtitle: "High Education Level",
    bgColor: "bg-green-50",
    iconColor: "text-orange-500",
    courses: 75,
  },
  {
    id: 8,
    icon: Laptop,
    title: "Development",
    subtitle: "Improve your business",
    bgColor: "bg-purple-50",
    iconColor: "text-green-500",
    courses: 90,
  },
];

export function CategoriesSectionAnimated() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className='py-16 md:py-24 bg-linear-to-b from-white via-gray-50 to-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <SectionMiddleHeader
          title='Most demanding categories'
          subtitle='Learn from expert instructors in Bangla. Upgrade your skills with the most popular and effective online courses.'
        />

        <div className='py-16 grid grid-cols-2  lg:grid-cols-4 gap-4 xl:gap-6'>
          {categoriesData.map((category, index) => {
            const Icon = category.icon;
            const isHovered = hoveredId === category.id;

            return (
              <div
                key={category.id}
                className={`
                  group shadow-sm relative ${category.bgColor} rounded-lg px-6 py-4
                  transition-all duration-300 
                  hover:shadow-xl hover:-translate-y-2
                  cursor-pointer border border-transparent hover:border-gray-200
                  ${isHovered ? "scale-105" : "scale-100"}
                `}
                onMouseEnter={() => setHoveredId(category.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Icon */}
                <div className='mb-4'>
                  <div
                    className={`
                    w-14 h-14 ${category.bgColor} rounded-xl 
                    flex items-center justify-center
                    transition-all duration-300
                    shadow-sm
                    ${isHovered ? "scale-110 rotate-6" : "scale-100 rotate-0"}
                  `}
                  >
                    <Icon className={`w-7 h-7 ${category.iconColor}`} />
                  </div>
                </div>

                {/* Content */}
                <div className='space-y-1 mb-3'>
                  <h4
                    className={`
                    text-lg font-bold transition-colors
                    ${isHovered ? "text-orange-600" : "text-gray-900"}
                  `}
                  >
                    {category.title}
                  </h4>
                  <p className='text-sm text-gray-500 font-medium'>{category.subtitle}</p>
                </div>

                {/* Course Count (Shows on Hover) */}
                <div
                  className={`
    hidden md:flex items-center gap-2 text-sm font-semibold text-gray-700
    transition-all duration-300
    ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
  `}
                >
                  <span>{category.courses} Courses</span>
                  <ArrowRight className='w-4 h-4' />
                </div>

                {/* Decorative Corner */}
                <div
                  className={`
                  absolute top-6 right-6 
                  transition-all duration-300
                  ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-50"}
                `}
                >
                  <div className='w-8 h-8 bg-white/50 rounded-full flex items-center justify-center'>
                    <ArrowRight className='w-4 h-4 text-gray-600' />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className='text-center'>
          <BorderGradientButton
            // onClick={() => console.log("View all button clicked")}
            icon={ArrowRight}
          >
            Browse All Categories
          </BorderGradientButton>
        </div>
      </div>
    </section>
  );
}
