"use client";

import { ChevronRight, X } from "lucide-react";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuSections = [
  {
    title: "Navigation",
    items: [
      { label: "Sign In/Up", href: "/auth" },
      { label: "Instructors", href: "/instructors" },
      { label: "Students", href: "/students" },
      { label: "Events", href: "/events" },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "Groups", href: "/groups" },
      { label: "Challenge", href: "/challenge" },
      { label: "Workshop", href: "/workshop" },
      { label: "Learn Together", href: "/learn-together" },
    ],
  },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className='fixed inset-0 bg-black/50 z-50 lg:hidden animate-fade-in'
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className='fixed inset-y-0 right-0 w-80 max-w-full bg-white shadow-2xl z-50 lg:hidden animate-slide-in-right overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-bold text-gray-900'>Menu</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            aria-label='Close menu'
          >
            <X className='w-6 h-6 text-gray-700' />
          </button>
        </div>

        {/* Menu Content */}
        <div className='p-6 space-y-6'>
          {menuSections.map(section => (
            <div key={section.title}>
              <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
                {section.title}
              </h3>
              <div className='space-y-1'>
                {section.items.map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300
                        ${
                          isActive
                            ? "bg-orange-50 text-orange-600 font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                      onClick={onClose}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className='w-4 h-4' />
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className='absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-gray-50'>
          <button className='w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md font-semibold'>
            Get Started
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
