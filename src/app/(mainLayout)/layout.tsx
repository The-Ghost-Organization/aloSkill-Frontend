"use client";

import FooterSimple from "@/components/shared/footer/FooterSimple.tsx";
import AnnouncementBar from "@/components/shared/header/AnnouncementBar";
import NavBar from "@/components/shared/header/NavBar";
import LeftSidebar from "@/components/shared/sidebars/LeftSidebar";

import RightSidebar from "@/components/shared/sidebars/RightSidebar";
import { useState } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <div className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'>
        <AnnouncementBar />
        <NavBar onMenuToggle={() => setIsSidebarOpen(prev => !prev)} />
      </div>
      <div className='flex flex-1 pt-12'>
        {" "}
        <LeftSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className='flex-1 min-w-0 lg:ml-0 xl:mr-0'>
          {" "}
          <div className='container mx-auto  py-6 max-w-7xl'>{children}</div>
        </main>
        <RightSidebar />
      </div>
      <FooterSimple />
    </div>
  );
}
