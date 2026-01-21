"use client";

import { BookOpen, Calendar, Home, Menu, Users, X } from "lucide-react";
import { useState } from "react";

const quickLinks = [
  { icon: Home, label: "Home", href: "/" },
  { icon: BookOpen, label: "Courses", href: "/courses" },
  { icon: Users, label: "Community", href: "/community" },
  { icon: Calendar, label: "Events", href: "/events" },
];

export default function TabletDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Toggle Button (Tablet Only) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='fixed bottom-6 right-6 z-40 md:hidden lg:hidden p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300'
        aria-label='Toggle quick menu'
      >
        {isOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
      </button>

      {/* Drawer */}
      {isOpen && (
        <>
          <div
            className='fixed inset-0 bg-black/30 z-30 md:block lg:hidden'
            onClick={() => setIsOpen(false)}
          />
          <div className='fixed bottom-20 right-6 w-64 bg-white rounded-2xl shadow-2xl z-40 md:block lg:hidden overflow-hidden animate-scale-up'>
            <div className='p-4 space-y-2'>
              {quickLinks.map(link => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors'
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className='w-5 h-5 text-orange-500' />
                    <span className='font-medium text-gray-700'>{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
