import { CheckCircle2, type LucideIcon } from "lucide-react";
import "./PageHeading.css";

interface PageHeadingProps {
  badge?: string;
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
  badgeIcon?: LucideIcon;
  showDefaultIcon?: boolean;
}

// Reusable Hero Component
export const PageHeading = ({
  badge = "Terms and conditions",
  title = "Best selling courses in ALOSKILL",
  titleHighlight,
  subtitle = "Together, we can make a real impact in communities around the world. Help us bring hope and support",
  badgeIcon: BadgeIcon,
  showDefaultIcon = true,
}: PageHeadingProps) => {
  // Determine which icon to render
  const IconComponent = BadgeIcon || CheckCircle2;
  const shouldShowIcon = BadgeIcon || showDefaultIcon;

  return (
    <section className='relative w-full min-h-[250px] flex items-center justify-center px-4 py-6  md:py-10  overflow-hidden'>
      <div className='absolute inset-0 bg-transparent opacity-80 animate-gradient-shift' />
      <div className='absolute top-10 left-10 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-pink-200 rounded-full blur-3xl opacity-40 animate-float' />
      <div className='absolute bottom-10 right-10 w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 bg-white rounded-full blur-3xl opacity-40 animate-float-delayed' />
      <div className='absolute top-1/2 right-1/4 w-24 h-24 sm:w-32 sm:h-32 bg-blue-200 rounded-full blur-2xl opacity-30 animate-pulse-slow' />
      <div className='absolute bottom-1/3 left-1/4 w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-full blur-2xl opacity-30 animate-pulse-slower' />
      <div className='relative z-10 max-w-4xl mx-auto text-center animate-fade-in-up'>
        <div className='inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm rounded-full shadow-sm animate-fade-in transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer group'>
          {shouldShowIcon && (
            <div className='w-6 h-6 sm:w-6 sm:h-6 bg-linear-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shrink-0 animate-pulse-gentle animate-rotate-gradient mr-2'>
              <IconComponent
                className='w-4 h-4 sm:w-3.5 sm:h-3.5 text-white animate-check-pop'
                strokeWidth={3}
              />
            </div>
          )}
          <span className='text-sm text-gray-600 font-medium'>{badge}</span>
        </div>
        <h2 className='text-2xl md:text-3xl  font-bold mb-2  leading-tight px-2 animate-fade-in-up-delayed'>
          {title}
          {titleHighlight && (
            <span
              className='block mt-2'
              style={{
                background: "linear-gradient(135deg, #da7c36 0%, #d15100 20%, #fc9759 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {titleHighlight}
            </span>
          )}
        </h2>
        <p className='text-md  text-gray-600 max-w-2xl mx-auto leading-relaxed px-4 animate-fade-in-up-more-delayed'>
          {subtitle}
        </p>
      </div>
    </section>
  );
};
