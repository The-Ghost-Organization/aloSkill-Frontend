"use client";

import { type LucideIcon, Loader2 } from "lucide-react";
import "./GradientButton.css";

type GradientButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  iconAnimation?: "none" | "spin" | "pulse" | "bounce" | "slide";
  loading?: boolean;
  loadingText?: string;
  size?: "sm" | "md" | "lg";
  variant?: "gradient" | "solid";
};

export default function GradientButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  iconAnimation = "slide",
  className = "",
  loading = false,
  loadingText,
  size = "md",
  variant = "gradient",
}: GradientButtonProps) {
  const isDisabled = disabled || loading;

  const sizeClasses = {
    sm: "h-10 px-4 text-sm gap-1.5",
    md: "h-12 px-8 text-base gap-2",
    lg: "h-14 px-10 text-lg gap-2.5",
  };

  const iconAnimationClass = {
    none: "",
    spin: "animate-spin",
    pulse: "animate-pulse-scale",
    bounce: "animate-bounce-y",
    slide: "animate-slide-x",
  };

  const backgroundClasses = {
    gradient: "gradient-button-bg animate-gradient hover:animate-gradient-fast",
    solid: "solid-button-bg",
  };

  const renderIcon = () => {
    if (!Icon) return null;

    const iconClass = `transition-transform duration-300 ease-in-out ${iconAnimationClass[iconAnimation]}`;

    return (
      <Icon
        className={iconClass}
        aria-hidden='true'
      />
    );
  };

  const buttonClass = [
    "inline-flex items-center justify-center rounded-lg font-semibold text-white",
    "border-none outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
    "transition-all duration-200 ease-in-out",
    sizeClasses[size],
    backgroundClasses[variant],
    isDisabled
      ? "opacity-50 cursor-not-allowed"
      : "hover:-translate-y-1 hover:shadow-2xl active:scale-95",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={buttonClass}
      aria-busy={loading}
      aria-disabled={isDisabled}
    >
      {loading ? (
        <>
          <Loader2
            className='animate-spin'
            aria-hidden='true'
            size={size === "sm" ? 16 : size === "lg" ? 24 : 20}
          />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {iconPosition === "left" && renderIcon()}
          <span>{children}</span>
          {iconPosition === "right" && renderIcon()}
        </>
      )}
    </button>
  );
}
