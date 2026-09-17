"use client";
import MobileMenu from "@/components/shared/menu/MobileMenu";
import { useState } from "react";

export default function MobileMenuWrapper() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <MobileMenu
      isOpen={isMobileMenuOpen}
      onClose={() => setIsMobileMenuOpen(false)}
    />
  );
}
