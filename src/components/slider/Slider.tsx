
"use client";

import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface BreakpointConfig {
  visibleCount: number;
}

interface SliderProps {
  slides: ReactNode[];
  visibleCount?: number;
  breakpoints?: Record<number, BreakpointConfig>;
  autoplay?: boolean;
  autoplayInterval?: number;
  loop?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
  gap?: number;
}

export default function Slider({
  slides,
  visibleCount = 1,
  breakpoints,
  autoplay = false,
  autoplayInterval = 3000,
  loop = false,
  showDots = true,
  showArrows = true,
  gap = 16,
}: SliderProps) {
  const [currentVisible, setCurrentVisible] = useState(visibleCount);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = slides.length;
  const maxIndex = Math.max(total - currentVisible, 0);

  // Responsive logic
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newCount = visibleCount;
      if (breakpoints) {
        const sortedBps = Object.keys(breakpoints)
          .map(Number)
          .sort((a, b) => a - b);
        for (const bp of sortedBps) {
          if (width >= bp) newCount = breakpoints[bp]?.visibleCount ?? newCount;
        }
      }
      setCurrentVisible(newCount);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoints, visibleCount]);

  useEffect(() => {
    if (index > maxIndex) setIndex(maxIndex);
  }, [maxIndex, index]);

  const next = useCallback(() => {
    setIndex(prev => (prev >= maxIndex ? (loop ? 0 : prev) : prev + 1));
  }, [maxIndex, loop]);

  const prev = useCallback(() => {
    setIndex(prev => (prev <= 0 ? (loop ? maxIndex : 0) : prev - 1));
  }, [maxIndex, loop]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || maxIndex === 0 || isPaused) return;
    const timer = setInterval(next, autoplayInterval);
    return () => clearInterval(timer);
  }, [autoplay, autoplayInterval, maxIndex, isPaused, next]);

  // Drag Handler
  const onDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50; // minimum distance to trigger slide change
    const velocityThreshold = 500; // allow fast flicks to trigger slide change

    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      next();
    } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      prev();
    }
  };

  const slideWidth = 100 / currentVisible;
  const movePercentage = index * (100 / currentVisible);
  const gapOffset = (index * gap) / currentVisible;

  return (
    <div
      className='relative w-full group touch-pan-y'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={containerRef}
    >
      <div className='overflow-hidden'>
        <motion.div
          className='flex cursor-grab active:cursor-grabbing'
          style={{ gap: `${gap}px` }}
          // DRAG PROPS
          drag='x'
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsPaused(true)}
          onDragEnd={onDragEnd}
          // ANIMATION PROPS
          animate={{ x: `calc(-${movePercentage}% - ${gapOffset}px)` }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 25,
            mass: 1,
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className='shrink-0 select-none' // prevents text/image highlighting while dragging
              style={{
                width: `calc(${slideWidth}% - ${(gap * (currentVisible - 1)) / currentVisible}px)`,
              }}
            >
              {slide}
            </div>
          ))}
        </motion.div>
      </div>

      {showArrows && maxIndex > 0 && (
        <>
          <button
            onClick={prev}
            disabled={!loop && index === 0}
            className='absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all disabled:opacity-0 opacity-0 group-hover:opacity-100 hidden md:block'
            aria-label='Previous slide'
          >
            <ChevronLeft className='w-5 h-5 text-gray-800' />
          </button>
          <button
            onClick={next}
            disabled={!loop && index === maxIndex}
            className='absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all disabled:opacity-0 opacity-0 group-hover:opacity-100 hidden md:block'
            aria-label='Next slide'
          >
            <ChevronRight className='w-5 h-5 text-gray-800' />
          </button>
        </>
      )}

      {showDots && maxIndex > 0 && (
        <div className='flex justify-center gap-2 mt-4'>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 transition-all duration-300 rounded-full ${
                i === index ? "bg-orange-500 w-6" : "bg-gray-300 w-2"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
