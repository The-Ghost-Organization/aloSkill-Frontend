// StatsSection.tsx
"use client";

import { Award, BookOpen, type LucideIcon, Star, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./StatsSection.css";

interface Stat {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix: string;
  decimals?: number;
  color: string;
}

const stats: Stat[] = [
  { icon: Users, label: "Active Students", value: 50000, suffix: "+", color: "text-blue-500" },
  { icon: BookOpen, label: "Courses", value: 1200, suffix: "+", color: "text-orange-500" },
  { icon: Award, label: "Certificates", value: 25000, suffix: "+", color: "text-purple-500" },
  {
    icon: Star,
    label: "Average Rating",
    value: 4.9,
    suffix: "/5",
    decimals: 1,
    color: "text-yellow-500",
  },
];

// Custom hook for counting animation
function useCountUp(
  end: number,
  duration: number = 2000,
  decimals: number = 0,
  start: number = 0
): [string, React.MutableRefObject<HTMLDivElement | null>] {
  const [count, setCount] = useState<number>(start);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const countRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry?.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | undefined;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = start + (end - start) * easeOutQuart;

      setCount(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start, isVisible]);

  return [count.toFixed(decimals), countRef];
}

interface StatCardProps {
  stat: Stat;
  index: number;
}

function StatCard({ stat, index }: StatCardProps) {
  const Icon = stat.icon;
  const [count, countRef] = useCountUp(stat.value, 2000, stat.decimals || 0);

  return (
    <div
      ref={countRef}
      className='text-center space-y-2 group cursor-pointer opacity-0 animate-fadeInUp'
      style={{
        animationDelay: `${index * 150}ms`,
        animationFillMode: "forwards",
      }}
    >
      <div className='flex justify-center mb-3'>
        <div className='p-4 bg-white rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-3 group-hover:scale-110'>
          <Icon className={`w-8 h-8 ${stat.color} transition-transform duration-300`} />
        </div>
      </div>
      <p className='text-xl font-bold  group-hover:text-orange-500 transition-colors duration-300 tabular-nums'>
        {count}
        <span className='text-xl'>{stat.suffix}</span>
      </p>
      <p className='text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors'>
        {stat.label}
      </p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className='py-16 bg-white/50 backdrop-blur-sm'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              stat={stat}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
