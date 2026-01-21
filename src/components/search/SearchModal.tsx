"use client";

import { Clock, Search, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const trendingSearches = [
  "Web Development",
  "Data Science",
  "Machine Learning",
  "Digital Marketing",
  "UI/UX Design",
];

const recentSearches = ["Python Programming", "React Basics", "Bangla Literature"];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative min-h-screen flex items-start justify-center p-4 pt-20'>
        <div className='relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-slide-up'>
          {/* Search Input */}
          <div className='flex items-center gap-3 p-6 border-b border-gray-200'>
            <Search className='w-6 h-6 text-gray-400' />
            <input
              type='text'
              placeholder='Search for anything...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='flex-1 text-lg outline-none'
              autoFocus
            />
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X className='w-5 h-5 text-gray-500' />
            </button>
          </div>

          {/* Search Content */}
          <div className='p-6 space-y-6 max-h-96 overflow-y-auto'>
            {/* Trending Searches */}
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <TrendingUp className='w-4 h-4 text-orange-500' />
                <h3 className='text-sm font-semibold text-gray-900'>Trending</h3>
              </div>
              <div className='flex flex-wrap gap-2'>
                {trendingSearches.map(term => (
                  <button
                    key={term}
                    className='px-4 py-2 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-full text-sm transition-colors'
                    onClick={() => setSearchQuery(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <Clock className='w-4 h-4 text-gray-500' />
                <h3 className='text-sm font-semibold text-gray-900'>Recent</h3>
              </div>
              <div className='space-y-2'>
                {recentSearches.map(term => (
                  <button
                    key={term}
                    className='flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 rounded-lg text-left transition-colors'
                    onClick={() => setSearchQuery(term)}
                  >
                    <Search className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-700'>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
