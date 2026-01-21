"use client";

import { type LucideIcon } from "lucide-react";
import styles from "./BorderGradientButton.module.css";

type BorderGradientButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
};

export default function BorderGradientButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  icon: Icon,
  className = "",
}: BorderGradientButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles["button"]} ${className}`}
    >
      <span className={styles["border"]} />
      <span className={styles["content"]}>
        {children}
        {Icon && <Icon size={16} />}
      </span>
    </button>
  );
}
