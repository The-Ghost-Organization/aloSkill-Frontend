"use client";

import FooterSimple from "@/components/shared/footer/FooterSimple.tsx";
import NavBar from "@/components/shared/header/NavBar";
import { useState } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <div className='fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm'>
        <NavBar onMenuToggle={() => setIsSidebarOpen(prev => !prev)} />
      </div>
      <main className='pt-20 min-h-screen'>{children}</main>
      <FooterSimple />
    </div>
  );
}
