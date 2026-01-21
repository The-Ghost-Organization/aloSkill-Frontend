"use client";

import { ArrowRight, type LucideIcon } from "lucide-react";
import { memo } from "react";
import GradientButton from "../buttons/GradientButton";

interface SectionHeaderProps {
  badge?: string;
  title: string | React.ReactNode;
  subtitle?: string;
  showButton?: boolean;
  buttonText?: string;
  buttonIcon?: LucideIcon;
  buttonIconPosition?: "left" | "right";
  buttonIconAnimation?: "none" | "spin" | "pulse" | "bounce" | "slide";
  onButtonClick?: () => void;
  isLoading?: boolean;
  loadingText?: string;
  buttonClassName?: string;
}

const SectionHeader = memo(function SectionHeader({
  badge,
  title,
  subtitle,
  showButton = false,
  buttonText = "Load More",
  buttonIcon: ButtonIcon = ArrowRight,
  buttonIconPosition = "right",
  buttonIconAnimation = "slide",
  onButtonClick,
  isLoading = false,
  loadingText,
  buttonClassName,
}: SectionHeaderProps) {
  return (
    <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6'>
      <div className='flex-1'>
        {badge && (
          <div className='inline-block mb-4'>
            <span className='px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm  uppercase tracking-wide'>
              {badge}
            </span>
          </div>
        )}
        <h2 className='text-2xl font-black '>{title}</h2>
        {subtitle && <p className='mt-6 text-gray-600 text-md'>{subtitle}</p>}
      </div>

      {showButton && (
        <GradientButton
          onClick={onButtonClick}
          loading={isLoading}
          loadingText={loadingText}
          icon={ButtonIcon}
          iconPosition={buttonIconPosition}
          iconAnimation={buttonIconAnimation}
          className={buttonClassName}
        >
          {buttonText}
        </GradientButton>
      )}
    </div>
  );
});

export default SectionHeader;
