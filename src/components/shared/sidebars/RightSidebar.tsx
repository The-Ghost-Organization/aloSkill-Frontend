"use client";

import { BookOpen, ChevronLeft, ChevronRight, Sparkles, Star, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarImageSlider } from "./SidebarImageSlider.jsx";

const cards = [
  {
    id: 1,
    icon: BookOpen,
    title: "Discover New Books Every Day",
    gradient: "from-orange-100 to-orange-50",
    iconColor: "text-orange-500",
  },
  {
    id: 2,
    icon: Sparkles,
    title: "Explore Amazing Stories",
    gradient: "from-purple-100 to-purple-50",
    iconColor: "text-purple-500",
  },
  {
    id: 3,
    icon: Star,
    title: "Rated by Thousands",
    gradient: "from-blue-100 to-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: 4,
    icon: TrendingUp,
    title: "Trending This Week",
    gradient: "from-pink-100 to-pink-50",
    iconColor: "text-pink-500",
  },
];

export default function RightSidebar() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll cards
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentCardIndex(prev => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentCard = cards[currentCardIndex] ?? cards[0];
  if (!currentCard) return null;
  const CurrentIcon = currentCard.icon;

  return (
    <aside
      className='hidden xl:block sticky top-28 right-0 w-56 h-[calc(100vh-6rem)] overflow-y-auto'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className='p-4 space-y-4'>
        {/* Image Slider */}
        <SidebarImageSlider />

        {/* Animated Card Slider */}
        <div className='relative group'>
          <div
            className={`bg-linear-to-br ${currentCard.gradient} rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 min-h-40`}
          >
            <div className={`${currentCard.iconColor} mb-3`}>
              <CurrentIcon className='w-10 h-10' />
            </div>
            <p className='text-sm font-medium text-gray-800 leading-relaxed'>{currentCard.title}</p>

            {/* Card Dot Indicators */}
            <div className='flex gap-2 mt-4'>
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCardIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentCardIndex
                      ? "bg-gray-600 w-6"
                      : "bg-gray-300 w-1.5 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to card ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Card Navigation Arrows */}
          <button
            onClick={() => setCurrentCardIndex(prev => (prev - 1 + cards.length) % cards.length)}
            className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            aria-label='Previous card'
          >
            <ChevronLeft className='w-4 h-4 text-gray-700' />
          </button>
          <button
            onClick={() => setCurrentCardIndex(prev => (prev + 1) % cards.length)}
            className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            aria-label='Next card'
          >
            <ChevronRight className='w-4 h-4 text-gray-700' />
          </button>
        </div>

        {/* Static Cards */}
        <div className='space-y-4'>
          {cards.slice(0, 2).map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`bg-lenear-to-br ${card.gradient} rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-gray-100`}
              >
                <div className={`${card.iconColor} mb-3`}>
                  <Icon className='w-10 h-10' />
                </div>
                <p className='text-sm font-medium text-gray-800 leading-relaxed'>{card.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
