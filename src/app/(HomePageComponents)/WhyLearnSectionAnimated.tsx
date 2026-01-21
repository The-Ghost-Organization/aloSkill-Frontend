"use client";

import SectionMiddleHeader from "@/components/sections/SectionMiddleHeader.tsx";
import { ArrowRight, Briefcase, GraduationCap, Monitor } from "lucide-react";
import { useState } from "react";

const features = [
  {
    id: 1,
    icon: Monitor,
    step: "01",
    title: "Learn",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Felis donec massa aliquip.",
  },
  {
    id: 2,
    icon: GraduationCap,
    step: "02",
    title: "Graduate",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Felis donec massa aliquip.",
  },
  {
    id: 3,
    icon: Briefcase,
    step: "03",
    title: "Work",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Felis donec massa aliquip.",
  },
];

export function WhyLearnSectionAnimated() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className='py-16 md:py-24 bg-linear-to-b from-gray-50 to-white '>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <SectionMiddleHeader
          title='Why Learn With Us?'
          subtitle='Our Courses are designed to help you achieve your goals. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempordunt ut
            labore vanum...'
        />

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-0 mt-10'>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredIndex === index;
            const isNotLast = index < features.length - 1;

            return (
              <div
                key={feature.id}
                className='relative'
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Card */}
                <div
                  className={`
                  text-center space-y-4 p-6 rounded-2xl transition-all duration-300
                  ${isHovered ? "bg-white shadow-xl -translate-y-2" : "bg-transparent"}
                `}
                >
                  {/* Icon */}
                  <div className='flex justify-center mb-6'>
                    <div
                      className={`
                      relative p-6 bg-orange-100 rounded-2xl 
                      transition-all duration-300
                      ${isHovered ? "scale-110 shadow-lg bg-orange-200" : ""}
                    `}
                    >
                      <Icon
                        className={`
                          w-10 h-10 stroke-[1.5] transition-colors duration-300
                          ${isHovered ? "text-white" : "text-orange-200"}
                        `}
                      />
                    </div>
                  </div>

                  {/* Step & Title */}
                  <div className='space-y-2'>
                    <h3
                      className={`
                      text-xl  transition-colors duration-300
                      ${isHovered ? "text-orange-600" : "text-gray-900"}
                    `}
                    >
                      {feature.step}. {feature.title}{" "}
                    </h3>
                    <p className='text-gray-600 text-sm md:text-base leading-relaxed'>
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover Arrow */}
                  {isHovered && (
                    <div className='flex justify-center pt-4 animate-fade-in'>
                      <ArrowRight className='w-6 h-6 text-orange-500 animate-pulse' />
                    </div>
                  )}
                </div>

                {/* Animated Divider for Desktop */}
                {isNotLast && (
                  <div className='hidden lg:block absolute top-1/4 right-0 w-px h-32'>
                    <div
                      className={`
                      w-full h-full bg-linear-to-b from-transparent via-gray-300 to-transparent
                      transition-all duration-500
                      ${isHovered || hoveredIndex === index + 1 ? "opacity-100 scale-y-110" : "opacity-50"}
                    `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
