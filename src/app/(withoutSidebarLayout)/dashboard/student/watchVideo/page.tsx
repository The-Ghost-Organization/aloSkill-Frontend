"use client";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Maximize,
  Pause,
  Play,
  PlayCircle,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const LMSVideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  // const [completedLectures, setCompletedLectures] = useState([0, 1]);

  const courseSections = [
    {
      id: 0,
      title: "Getting Started",
      lectures: 4,
      duration: "33m",
      progress: 100,
      items: [
        { id: 0, title: "What is Webflow?", duration: "5m 12s", completed: true },
        { id: 1, title: "Sign up in Webflow", duration: "4m 30s", completed: true, active: true },
        { id: 2, title: "Basics of Webflow", duration: "12m 45s", completed: false },
        { id: 3, title: "Figma Introduction", duration: "10m 33s", completed: false },
      ],
    },
    {
      id: 1,
      title: "Secrets of Great Design",
      lectures: 8,
      duration: "1h 23m",
      progress: 0,
      items: [],
    },
    {
      id: 2,
      title: "Practice: Design Like an Artist",
      lectures: 12,
      duration: "2h 15m",
      progress: 0,
      items: [],
    },
    {
      id: 3,
      title: "Web Development (webflow)",
      lectures: 15,
      duration: "3h 45m",
      progress: 0,
      items: [],
    },
    {
      id: 4,
      title: "Secrets of Making Money Freelancing",
      lectures: 6,
      duration: "1h 12m",
      progress: 0,
      items: [],
    },
    {
      id: 5,
      title: "Advanced",
      lectures: 10,
      duration: "2h 30m",
      progress: 0,
      items: [],
    },
    {
      id: 6,
      title: "What's Next",
      lectures: 3,
      duration: "45m",
      progress: 0,
      items: [],
    },
  ];

  return (
    <div className='flex h-screen bg-white'>
      {/* Main Content Area */}
      <div className='flex-1 flex flex-col'>
        {/* Top Navigation */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <div className='flex items-center gap-4'>
            <button className='text-gray-600 hover:text-gray-900'>
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className='text-lg font-semibold text-gray-900'>
                Complete Website Responsive Design: From Figma to Webflow to Website Design
              </h1>
              <div className='flex items-center gap-4 mt-1 text-sm text-gray-500'>
                <span className='flex items-center gap-1'>
                  <PlayCircle size={16} />
                  285 lectures
                </span>
                <span className='flex items-center gap-1'>
                  <Clock size={16} />
                  16h 34m
                </span>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <button className='px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50'>
              Write a Review
            </button>
            <button
              className='px-4 py-2 text-sm font-medium text-white rounded-lg'
              style={{ backgroundColor: "var(--color-orange)" }}
            >
              Next Lecture
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className='relative bg-black flex-1 flex items-center justify-center'>
          {/* Placeholder for video - replace with actual video element */}
          <div className='relative w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center'>
            <Image
              width={200}
              height={100}
              src='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop'
              alt='Video thumbnail'
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-black bg-opacity-20'></div>

            {/* Play/Pause Overlay */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className='absolute inset-0 flex items-center justify-center group'
            >
              {!isPlaying && (
                <div className='w-20 h-20 rounded-full bg-white bg-opacity-90 flex items-center justify-center group-hover:scale-110 transition-transform'>
                  <Play
                    size={32}
                    className='text-gray-900 ml-1'
                    fill='currentColor'
                  />
                </div>
              )}
            </button>

            {/* Video Controls */}
            <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4'>
              <div className='flex items-center gap-4'>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className='text-white hover:text-gray-300'
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button className='text-white hover:text-gray-300'>
                  <ChevronLeft size={20} />
                </button>
                <button className='text-white hover:text-gray-300'>
                  <ChevronRight size={20} />
                </button>

                {/* Progress Bar */}
                <div className='flex-1 flex items-center gap-2'>
                  <span className='text-white text-sm'>1:25</span>
                  <div className='flex-1 h-1 bg-gray-600 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-white rounded-full'
                      style={{ width: "35%" }}
                    ></div>
                  </div>
                  <span className='text-white text-sm'>5:10</span>
                </div>

                <button className='text-white hover:text-gray-300'>
                  <Volume2 size={20} />
                </button>
                <button className='text-white hover:text-gray-300'>
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className='border-t border-gray-200'>
          <div className='flex gap-6 px-6 pt-4'>
            <button
              className='pb-2 text-sm font-medium border-b-2'
              style={{ color: "var(--color-text-dark)", borderColor: "var(--color-orange)" }}
            >
              Description
            </button>
            <button className='pb-2 text-sm font-medium text-gray-500 hover:text-gray-900'>
              Lectures Notes
            </button>
            <button className='pb-2 text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1'>
              Attach File
              <span
                className='px-1.5 py-0.5 text-xs rounded'
                style={{ backgroundColor: "var(--color-orange)", color: "white" }}
              >
                01
              </span>
            </button>
            <button className='pb-2 text-sm font-medium text-gray-500 hover:text-gray-900'>
              Comments
            </button>
          </div>

          {/* Content */}
          <div className='px-6 py-4 max-h-48 overflow-y-auto'>
            <h3 className='font-semibold text-gray-900 mb-2'>2. Sign up in Webflow</h3>
            <div className='flex items-center gap-3 text-sm text-gray-500 mb-4'>
              <span>Last updated: Oct 26, 2020</span>
              <span>Comments: 354</span>
            </div>
            <p className='text-sm text-gray-600 leading-relaxed'>
              We can interactively package your idea into your first website. From creating your
              first page through to uploading your website to the internet. For the first time, you
              can build amazing, bespoke websites. There are reasons this you can do whatever task
              Sketch OR Photoshop can do them work doing with me. At the end of each video I have a
              downloadable version of where we are in the process so that you can compare your
              progress...
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar - Course Contents */}
      <div className='w-96 border-l border-gray-200 flex flex-col'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <h2 className='font-semibold text-gray-900'>Course Contents</h2>
          <span
            className='text-sm font-medium'
            style={{ color: "var(--color-orange)" }}
          >
            18% Completed
          </span>
        </div>

        <div className='flex-1 overflow-y-auto'>
          {courseSections.map((section, idx) => (
            <div
              key={section.id}
              className='border-b border-gray-200'
            >
              <button
                onClick={() => setActiveSection(activeSection === idx ? -1 : idx)}
                className='w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50'
              >
                <div className='flex items-center gap-3 flex-1'>
                  <ChevronRight
                    size={16}
                    className={`text-gray-400 transition-transform ${activeSection === idx ? "rotate-90" : ""}`}
                  />
                  <div className='text-left flex-1'>
                    <div className='text-sm font-medium text-gray-900'>{section.title}</div>
                    <div className='text-xs text-gray-500 mt-0.5'>
                      {section.lectures} lectures • {section.duration}
                    </div>
                  </div>
                </div>
                {section.progress > 0 && (
                  <div
                    className='text-xs font-medium'
                    style={{ color: "var(--color-orange)" }}
                  >
                    {section.progress}%
                  </div>
                )}
              </button>

              {/* Lecture Items */}
              {activeSection === idx && section.items.length > 0 && (
                <div className='bg-gray-50'>
                  {section.items.map(item => (
                    <button
                      key={item.id}
                      className={`w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-100 ${
                        item.active ? "bg-orange-50" : ""
                      }`}
                    >
                      <div className='flex-shrink-0'>
                        {item.completed ? (
                          <CheckCircle
                            size={16}
                            style={{ color: "var(--color-orange)" }}
                          />
                        ) : item.active ? (
                          <PlayCircle
                            size={16}
                            style={{ color: "var(--color-orange)" }}
                          />
                        ) : (
                          <Lock
                            size={16}
                            className='text-gray-400'
                          />
                        )}
                      </div>
                      <div className='flex-1 text-left'>
                        <div
                          className={`text-sm ${item.active ? "font-medium" : ""}`}
                          style={{ color: item.active ? "var(--color-text-dark)" : undefined }}
                        >
                          {item.title}
                        </div>
                      </div>
                      <div className='text-xs text-gray-500'>{item.duration}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LMSVideoPlayer;
