"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface FadeSliderProps {
  slides: React.ReactNode[];
  autoplay?: boolean;
  autoplayInterval?: number;
  loop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
}

export default function FadeSlider({
  slides,
  autoplay = true,
  autoplayInterval = 3000,
  loop = true,
  showArrows = true,
  showDots = true,
  className = "",
}: FadeSliderProps) {
  const total = slides.length;
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (i: number) => {
      if (i < 0) {
        setIndex(loop ? total - 1 : 0);
      } else if (i >= total) {
        setIndex(loop ? 0 : total - 1);
      } else {
        setIndex(i);
      }
    },
    [loop, total]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // autoplay
  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => next(), autoplayInterval);
    return () => clearInterval(timer);
  }, [autoplay, autoplayInterval, next]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Slides */}
      <div className='relative w-full h-full'>
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out 
              ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            {slide}
          </div>
        ))}
      </div>

      {/* Arrows */}
      {showArrows && total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label='Previous slide'
            className='absolute left-2 top-1/2 -translate-y-1/2 
                       bg-white/80 hover:bg-white p-2 rounded-full shadow'
          >
            <ChevronLeft className='w-4 h-4 text-gray-700' />
          </button>

          <button
            onClick={next}
            aria-label='Next slide'
            className='absolute right-2 top-1/2 -translate-y-1/2 
                       bg-white/80 hover:bg-white p-2 rounded-full shadow'
          >
            <ChevronRight className='w-4 h-4 text-gray-700' />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && total > 1 && (
        <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2'>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300
                ${i === index ? "bg-white w-6" : "bg-white/60 hover:bg-white/90 w-2"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
