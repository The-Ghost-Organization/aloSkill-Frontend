"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  FileText,
  Loader,
  Lock,
  Pause,
  Play,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../../../lib/api/client";
import { getFileIdFromUrl } from "../../../../lib/course/utils";
import { useSessionContext } from "../../../contexts/SessionContext";
import type { CourseDetailsPrivate, PrivateLesson } from "../../courses/allCourses.types";
import AttachFileTab from "./AttachFileTab";
import BunnyVideoPlayer from "./BunnyVideoPlayer";
import CommentsTab from "./CommentsTab";
import DescriptionTab from "./DescriptionTab";
import LectureNotesTab from "./LectureNotesTab";
import { useRightClickProtection } from "./Userightclickprotection.ts";
import VideoProtectionWrapper from "./Videoprotectionwrapper.tsx";

const mapUser = new Map<string, string>();
export default function CoursePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("description");
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);
  const [isLoading, setIsLoading] = useState(false);
  const [course, setCourse] = useState<CourseDetailsPrivate | undefined>(undefined);
  const [activeContent, setActiveContent] = useState<PrivateLesson | null>(null);
  const [videoData, setVideoData] = useState<{
    libraryId: string;
    token: string;
    expiresAt: number;
    videoId: string;
  } | null>(null);
  const { id } = useParams();
  const { user } = useSessionContext();

  if (user) {
    mapUser.set("storedUser", user?.id);
  }

  const handleSuspiciousActivity = useCallback(
    async (action: string) => {
      // Fire-and-forget — don't await so it doesn't block the user
      apiClient
        .post("/course/security-event", {
          userId: user?.id,
          courseId: id,
          lessonId: activeContent?.id,
          action,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        })
        .catch(() => {}); // silently swallow — never break the player for this
    },
    [user?.id, id, activeContent?.id]
  );

  const handleSetActiveContents = useCallback(
    (moduleId = 1, lessonId = 1) => {
      const targetLesson = course?.modules
        .find(m => m.position === moduleId)
        ?.lessons.find(l => l.position === lessonId);

      if (!targetLesson) {
        setActiveContent(null);
        return;
      }

      if (moduleId === 1 && lessonId === 1) {
        setActiveContent(targetLesson);
        return;
      }
      const allLessons = course?.modules
        .sort((a, b) => a.position - b.position)
        .flatMap(m => m.lessons.sort((a, b) => a.position - b.position));

      const targetIndex = allLessons?.findIndex(l => l.id === targetLesson.id);
      const previousLesson =
        targetIndex !== undefined && targetIndex > 0 ? allLessons?.[targetIndex - 1] : undefined;

      const isPrevCompleted = previousLesson?.lessonProgress[0]?.completed;

      if (isPrevCompleted) {
        setActiveContent(targetLesson);
      } else {
        console.warn("Previous lesson not completed!");
      }
    },
    [course?.modules]
  );

  useEffect(() => {
    if (!id || !mapUser.get("storedUser")) return;
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<CourseDetailsPrivate>(
          `/course/private/viewCourse/${id}/${user?.id || mapUser.get("storedUser")}`
        );
        setCourse(response.data);
      } catch (error) {
        console.error("Failed to fetch Course", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [id, user]);

  const handleUpdateProgress = useCallback(
    async (updateData: {
      lessonId: string;
      lastPosition: number;
      progressValue: number;
      isFinished: boolean;
    }) => {
      if (typeof updateData.lessonId !== "string" || !updateData.lessonId) {
        console.error("Invalid lessonId provided");
        return;
      }
      const updateModule = course?.modules.find(m =>
        m.lessons.find(l => l.id === updateData.lessonId)
      );
      if (!updateModule) {
        console.warn(`Module not found for lessonId: ${updateData.lessonId}`);
        return;
      }
      const updatingLesson = updateModule.lessons.find(l => l.id === updateData.lessonId);
      if (!updatingLesson) {
        console.warn(`Lesson not found for lessonId: ${updateData.lessonId}`);
        return;
      }
      if (updatingLesson.lessonProgress[0]?.completed) return;

      const updateLesson = await apiClient.patch(`/course/update-lesson/${user?.id}`, {
        courseId: id,
        lessonId: updateData?.lessonId,
        progressValue: updateData?.progressValue,
        isFinished: updateData?.isFinished,
        lastPosition: updateData?.lastPosition,
      });

      if (updateLesson.success) {
        setCourse(prev => {
          if (!prev) return prev;

          return {
            ...prev,
            modules: prev.modules.map(mod => ({
              ...mod,
              lessons: mod.lessons.map(less => {
                if (less.id === updateLesson?.data) {
                  return {
                    ...less,
                    lessonProgress: [
                      {
                        ...(less.lessonProgress[0] || {
                          progressValue: 0,
                          lastPosition: 0,
                          lastViewedAt: null,
                          completedAt: null,
                          completed: false,
                        }),
                        completed: updateData?.isFinished ?? false,
                        completedAt: updateData?.isFinished ? new Date().toISOString() : null,
                        progressValue: updateData?.progressValue ?? 0,
                        lastPosition: updateData?.lastPosition ?? 0,
                      },
                    ],
                  };
                }
                return less;
              }),
            })),
          };
        });
      }
    },
    [id, user, course?.modules]
  );

  useEffect(() => {
    if (!activeContent?.contentUrl) {
      return;
    }
    try {
      const getVideoData = async () => {
        const getVideoFromBunny = await apiClient.post<{
          libraryId: string;
          token: string;
          videoId: string;
          expiresAt: number;
        }>("/course/get-video-url", {
          filePath: getFileIdFromUrl(activeContent?.contentUrl as string),
          duration: 1,
        });
        if (!getVideoFromBunny.success) {
          return;
        }
        if (getVideoFromBunny.data) {
          setVideoData(getVideoFromBunny.data);
        }
      };
      getVideoData();
    } catch (_error: unknown) {}
  }, [activeContent?.contentUrl]);

  useEffect(() => {
    if (activeContent) return;
    handleSetActiveContents(1, 1);
  }, [handleSetActiveContents, activeContent]);

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev =>
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };
  useRightClickProtection({
    disabled: process.env.NODE_ENV === "development", // remove this line in prod if you want it always on
    onAttempt: e => {
      // Optional: log to backend for abuse monitoring
      // apiClient.post("/course/security-event", {
      //   userId: user?.id,
      //   courseId: id,
      //   action: "right-click",
      //   timestamp: new Date().toISOString(),
      // }).catch(() => {});
    },
  });
  const progressCount = () => {
    if (course) {
      const allLessons = course.modules.flatMap(m => m.lessons);
      const total = allLessons.length;
      const completed = allLessons.filter(l => l.lessonProgress[0]?.completed).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return percentage;
    }
    return 0;
  };

  const tabs = [
    { id: "description", label: "Description", component: DescriptionTab },
    { id: "lectures", label: "Lectures Notes", component: LectureNotesTab },
    { id: "attach", label: "Attach File", component: AttachFileTab },
    { id: "comments", label: "Comments", component: CommentsTab },
  ];

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  if (isLoading) {
    return (
      <div className='min-h-screen flex gap-3 items-center justify-center'>
        <Loader className='w-8 h-8 text-gray-500 animate-spin' />
        <p className='text-gray-500'>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className='min-h-screen flex gap-3 items-center justify-center'>
        <p className='text-gray-500'>
          You are not Enrolled in this course or No course available with this request
        </p>
      </div>
    );
  }

  return (
    <div
      className='min-h-screen  bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 py-6'
      onContextMenu={e => e.preventDefault()}
      style={{ userSelect: "none" }}
    >
      {/* <DevToolsBlocker
        // disabled={process.env.NODE_ENV === "development"}
        onDetected={() =>
          apiClient
            .post("/course/security-event", {
              userId: user?.id,
              courseId: id,
              action: "devtools-opened",
            })
            .catch(() => {})
        }
      /> */}
      {/* Header */}
      <header className='bg-transparent shadow-md'>
        <div className='max-w-[90%]  mx-auto px-3 sm:px-4 lg:px-6 py-2.5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button
                className='cursor-pointer'
                onClick={() => router.back()}
              >
                <ChevronLeft className='w-5 h-5 text-gray-700' />
              </button>
              <div>
                <h1 className='text-md sm:text-lg mb-2 font-semibold text-gray-900'>
                  {course?.title || "Loading Course Title..."}
                </h1>
                <div className='flex items-center space-x-4 mt-1 text-sm text-gray-600'>
                  <span className='flex items-center space-x-1'>
                    <FileText className='w-4 h-4' />
                    <span>{course?.modules.length} Modules</span>
                  </span>
                  <span className='flex items-center space-x-1'>
                    <Play className='w-4 h-4' />
                    <span>{course?.content.totalLessons} Lectures</span>
                  </span>
                  <span className='flex items-center space-x-1'>
                    <Clock className='w-4 h-4' />
                    <span>{course?.content.totalDuration}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <button className='px-3 py-1.5 text-orange font-medium hover:bg-orange-100 rounded transition-colors duration-750'>
                Write A Review
              </button>
              <button className='px-3 py-1.5 bg-orange text-white font-medium rounded hover:bg-orange-500 transition-colors duration-500 cursor-pointer'>
                Next Lecture
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-[90%] mx-auto px-3 sm:px-4 lg:px-6 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Content */}
          <div className='lg:col-span-2'>
            {/* Video/Image Player */}
            <div className='bg-white overflow-hidden'>
              {/* <div className='aspect-video bg-linear-to-br from-teal-400 to-teal-500'>
                {videoData ? (
                  <>
                    <BunnyVideoPlayer
                      videoUrl={`https://iframe.mediadelivery.net/embed/${videoData.libraryId}/${videoData.videoId}?token=${videoData.token}&expires=${videoData.expiresAt}&autoplay=false&api=true&enableStats=true`}
                      lessonId={activeContent?.id as string}
                      lastPosition={activeContent?.lessonProgress[0]?.lastPosition as number}
                      handleUpdateProgress={handleUpdateProgress}
                    />
                  </>
                ) : (
                  <div className='min-h-screen flex gap-3 items-center justify-center'>
                    <Loader className='w-8 h-8 text-gray-500 animate-spin' />
                    <p className='text-gray-500'>Loading Lesson Video.</p>
                  </div>
                )}
              </div> */}
              <div className='aspect-video bg-linear-to-br from-teal-400 to-teal-500'>
                <VideoProtectionWrapper
                  watermarkText={user?.email ?? user?.id} // ties the watermark to the enrolled user
                  onSuspiciousActivity={handleSuspiciousActivity}
                  disableDevToolsDetection={false} // set true in dev to avoid annoyance
                >
                  {videoData ? (
                    <BunnyVideoPlayer
                      videoUrl={`https://iframe.mediadelivery.net/embed/${videoData.libraryId}/${videoData.videoId}?token=${videoData.token}&expires=${videoData.expiresAt}&autoplay=false&api=true&enableStats=true`}
                      lessonId={activeContent?.id as string}
                      lastPosition={activeContent?.lessonProgress[0]?.lastPosition as number}
                      handleUpdateProgress={handleUpdateProgress}
                      watermarkText={user?.email}
                      // disableProtection={process.env.NODE_ENV === "development"}
                    />
                  ) : (
                    <div className='min-h-screen flex gap-3 items-center justify-center'>
                      <Loader className='w-8 h-8 text-gray-500 animate-spin' />
                      <p className='text-gray-500'>Loading Lesson Video.</p>
                    </div>
                  )}
                </VideoProtectionWrapper>
              </div>
            </div>
            {/* <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Progress: {progress.toFixed(1)}%</span>
                {isCompleted && (
                  <span className='text-green-600 font-medium'>✔ Lesson Completed</span>
                )}
              </div>

              <div className='h-2 w-full rounded bg-gray-200'>
                <div
                  className='h-full rounded bg-blue-600 transition-all'
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div> */}
            {/* Lecture Title */}
            <div className='bg-transparent border-b border-gray-300 mt-4 pb-4'>
              <h2 className='text-lg font-bold text-gray-900'>{activeContent?.title}</h2>
              <span className='text-sm text-gray-500'>
                Last updated:{" "}
                {new Date(course.updatedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Tabs */}
            <div className='bg-transparent overflow-hidden'>
              <div className='border-b border-gray-300'>
                <div className='flex space-x-8'>
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`p-4 font-medium text-sm relative ${
                        activeTab === tab.id
                          ? "text-orange-500"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <span className='flex items-center space-x-2'>
                        <span>{tab.label}</span>
                        {tab.id === "attach" && (
                          <span className='px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full'>
                            {activeContent?.files?.length}
                          </span>
                        )}
                      </span>
                      {activeTab === tab.id && (
                        <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500' />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className='py-6'>
                {ActiveTabComponent && <ActiveTabComponent content={activeContent} />}
              </div>
            </div>
          </div>

          {/* Sidebar - Course Contents */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded py-6 pb-0 sticky top-22'>
              <div className='pb-6 mb-3 border-b border-gray-200'>
                <div className='px-4 flex items-center justify-between mb-3'>
                  <h3 className='text-md font-semibold text-gray-900'>Course Contents</h3>
                  <span className='text-sm font-semibold text-orange'>
                    {progressCount()}% Completed
                  </span>
                </div>
                <div className='px-4'>
                  <div className='w-full h-1 bg-gray-200 rounded-full'>
                    <div
                      className={`h-full bg-orange rounded-full`}
                      style={{ width: `${progressCount()}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className='max-h-[calc(100vh-250px)] overflow-y-auto'>
                {course?.modules.map(section => (
                  <div
                    key={section.position}
                    className='border border-gray-200 overflow-hidden'
                  >
                    <button
                      onClick={() => toggleSection(section.position)}
                      className='w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-center space-x-3'>
                        {expandedSections.includes(section.position) ? (
                          <ChevronUp className='w-5 h-5 text-orange-500' />
                        ) : (
                          <ChevronDown className='w-5 h-5 text-gray-400' />
                        )}
                        <div className='text-left'>
                          <h4 className='font-semibold text-gray-900 text-sm'>{section.title}</h4>
                          <div className='flex items-center space-x-3 mt-1 text-xs text-gray-500'>
                            <span className='flex items-center space-x-1'>
                              <Play className='w-3 h-3' />
                              <span>{section.lessons.length} lectures</span>
                            </span>
                            <span className='flex items-center space-x-1'>
                              <Clock className='w-3 h-3' />
                              <span>{section.moduleDuration}</span>
                            </span>
                            <span className='flex items-center space-x-1'>
                              <CheckCircle2 className='w-3 h-3 text-green-500' />
                              {(() => {
                                const completedCount =
                                  section?.lessons.reduce(
                                    (acc, lesson) =>
                                      lesson.lessonProgress[0]?.completed ? acc + 1 : acc,
                                    0
                                  ) || 0;

                                const totalLessons = section?.lessons.length || 0;
                                const percentage =
                                  totalLessons > 0
                                    ? Math.floor((completedCount / totalLessons) * 100)
                                    : 0;

                                return (
                                  <span>
                                    {percentage}% finished ({completedCount}/{totalLessons})
                                  </span>
                                );
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {expandedSections.includes(section.position) && section.lessons.length > 0 && (
                      <div className='border-t border-gray-200'>
                        {section.lessons.map(lesson => (
                          <div
                            key={lesson.position}
                            onClick={() =>
                              handleSetActiveContents(section.position, lesson.position)
                            }
                            className={`flex items-center justify-between p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                              activeContent?.id === lesson.id ? "bg-orange-50" : ""
                            }`}
                          >
                            <div className='flex items-center space-x-3'>
                              {lesson.lessonProgress[0]?.completed ? (
                                <CheckCircle2 className='w-4 h-4 text-orange-500' />
                              ) : (
                                <Lock className='w-4 h-4 text-gray-300' />
                              )}
                              <span className='text-sm text-gray-700'>{lesson.title}</span>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <span className='text-xs text-gray-500'>{lesson.duration}</span>
                              {activeContent?.id === lesson.id ? (
                                <Pause className='w-4 h-4 text-gray-700' />
                              ) : (
                                <Play className='w-4 h-4 text-gray-400' />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
