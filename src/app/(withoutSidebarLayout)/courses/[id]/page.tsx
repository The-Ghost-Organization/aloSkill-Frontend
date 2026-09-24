"use client";

import { useSessionContext } from "@/app/contexts/SessionContext.tsx";
import BorderGradientButton from "@/components/buttons/BorderGradientButton.tsx";
import GradientButton from "@/components/buttons/GradientButton.tsx";
import { apiClient } from "@/lib/api/client.ts";
import { FadeIn, getFileIdFromUrl, parseCourseDescription } from "@/lib/course/utils.tsx";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  Download,
  Facebook,
  FileText,
  GraduationCap,
  Heart,
  Home,
  Languages,
  Linkedin,
  ListVideo,
  Loader2,
  Play,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Twitter,
  Users,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { courseAddToCartHandler } from "../../../../lib/course/courseHelper.ts";
import type { CourseDetailsPublic } from "../allCourses.types.ts";
import { CurriculumTab } from "./(tabs)/CurriculumTab.tsx";
import InstructorTab from "./(tabs)/InstructorTab.tsx";
import OverviewTab from "./(tabs)/OverviewTab.tsx";
import ReviewsTab from "./(tabs)/ReviewsTab.tsx";

type VideoData = {
  libraryId: string;
  token: string;
  expiresAt: number;
  videoId: string;
} | null;

type CourseTab = "Overview" | "Curriculum" | "Instructor" | "Reviews";

const tabs: { label: CourseTab; icon: typeof BookOpen }[] = [
  { label: "Overview", icon: BookOpen },
  { label: "Curriculum", icon: ListVideo },
  { label: "Instructor", icon: GraduationCap },
  { label: "Reviews", icon: Star },
];

const formatDuration = (seconds?: number | null) => {
  const value = Math.max(0, Number(seconds ?? 0));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return value > 0 ? "< 1m" : "0m";
};

const formatPrice = (value?: number | null) => `$${Number(value ?? 0).toLocaleString()}`;

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params["id"] as string;
  const { setCartUpdate, user } = useSessionContext();

  const [activeTab, setActiveTab] = useState<CourseTab>("Overview");
  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => new Set([0]));
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [course, setCourse] = useState<CourseDetailsPublic>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVideoData, setModalVideoData] = useState<VideoData>(null);
  const [modalVideoLoading, setModalVideoLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoData>(null);
  const [videoDataLoading, setVideoDataLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const response = await apiClient.get<CourseDetailsPublic>(
          `/course/public/viewCourse/${courseId}`
        );

        if (!response.success || !response.data) {
          setLoadError("This course could not be loaded right now.");
          return;
        }

        setCourse(response.data);
      } catch (_error) {
        setLoadError("This course could not be loaded right now.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const fetchTrailer = async () => {
      if (!course?.trailerUrl) {
        setVideoData(null);
        setVideoDataLoading(false);
        return;
      }

      try {
        setVideoDataLoading(true);
        const response = await apiClient.post<{
          libraryId: string;
          token: string;
          videoId: string;
          expiresAt: number;
        }>("/course/get-video-url", {
          filePath: getFileIdFromUrl(course.trailerUrl),
          duration: 10,
        });

        if (response.success && response.data) setVideoData(response.data);
      } catch (_error) {
        setVideoData(null);
      } finally {
        setVideoDataLoading(false);
      }
    };

    void fetchTrailer();
  }, [course?.trailerUrl]);

  useEffect(() => {
    if (!user?.id) {
      setIsInWishlist(false);
      return;
    }

    void apiClient
      .get<Array<{ course: { id: string } | null }>>("/user/student/me/wishlist")
      .then(response => {
        if (!response.success) return;
        setIsInWishlist(
          (response.data ?? []).some(item => item.course?.id === courseId)
        );
      })
      .catch(() => undefined);
  }, [courseId, user?.id]);

  const courseDescriptionParsed = useMemo(
    () => parseCourseDescription(course?.description),
    [course?.description]
  );

  const getModalVideoData = useCallback(async (url: string) => {
    if (!url) return;

    try {
      setIsModalOpen(true);
      setModalVideoData(null);
      setModalVideoLoading(true);
      const response = await apiClient.post<{
        libraryId: string;
        token: string;
        videoId: string;
        expiresAt: number;
      }>("/course/get-video-url", {
        filePath: getFileIdFromUrl(url),
        duration: 10,
      });

      if (response.success && response.data) setModalVideoData(response.data);
    } finally {
      setModalVideoLoading(false);
    }
  }, []);

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const getRemainingDays = (endDate?: string | Date | null) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    if (Number.isNaN(end.getTime()) || end <= now) return 0;
    return Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
  };

  const handleAddToCart = () => {
    if (!course?.id) return;
    courseAddToCartHandler(course.id);
    setCartUpdate?.(prev => !prev);
  };

  const handleWishlist = async () => {
    if (!user?.id || !course?.id || wishlistLoading) return;

    try {
      setWishlistLoading(true);
      const response = await apiClient.post<{ wishlisted: boolean }>(
        "/user/student/me/wishlist",
        { courseId: course.id }
      );

      if (response.success && response.data) {
        setIsInWishlist(response.data.wishlisted);
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const shareCourse = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: course?.title, url });
        return;
      } catch (_error) {
        // Fall back to copying when the native share dialog is dismissed or unavailable.
      }
    }

    await navigator.clipboard?.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const openSocialShare = (network: "facebook" | "twitter" | "linkedin") => {
    const pageUrl = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(course?.title ?? "AloSkill course");
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${pageUrl}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`,
    };
    window.open(links[network], "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className='min-h-[70vh] bg-slate-50 flex items-center justify-center px-4'>
        <div className='flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-sm'>
          <Loader2 className='h-5 w-5 animate-spin text-orange-500' />
          Loading course details...
        </div>
      </div>
    );
  }

  if (loadError || !course) {
    return (
      <div className='min-h-[70vh] bg-slate-50 flex items-center justify-center px-4'>
        <div className='w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm'>
          <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600'>
            <BookOpen className='h-7 w-7' />
          </div>
          <h1 className='text-xl font-bold text-slate-900'>Unable to open this course</h1>
          <p className='mt-2 text-sm leading-6 text-slate-600'>{loadError}</p>
          <Link
            href='/courses'
            className='mt-6 inline-flex items-center gap-2 rounded-xl bg-[#074079] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0a4d90]'
          >
            Browse all courses <ChevronRight className='h-4 w-4' />
          </Link>
        </div>
      </div>
    );
  }

  const rating = Number(course.ratingAverage ?? 0);
  const reviewCount = course.ratingCount || course.reviews.length;
  const remainingDays = getRemainingDays(course.discountEndDate);
  const hasDiscount = Boolean(
    course.discountPrice && course.discountPrice > 0 && course.discountPrice < course.originalPrice
  );
  const effectivePrice = hasDiscount ? course.discountPrice : course.originalPrice;

  const courseIncludes = [
    { icon: Video, label: formatDuration(course.content.totalDuration), helper: "Video content" },
    { icon: FileText, label: `${course.content.totalLessons}`, helper: "Lessons" },
    { icon: Download, label: `${course.content.totalFiles}`, helper: "Resources" },
    { icon: ListVideo, label: `${course.content.totalModules}`, helper: "Modules" },
  ];

  return (
    <main className='min-h-screen bg-[#f7f9fc]'>
      <section className='relative overflow-hidden bg-[#062f58] text-white'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.22),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_40%)]' />
        <div className='absolute -right-24 top-10 h-72 w-72 rounded-full border border-white/10' />
        <div className='absolute -right-8 top-28 h-44 w-44 rounded-full border border-white/10' />

        <div className='relative mx-auto max-w-[1420px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10'>
          <FadeIn>
            <nav className='mb-7 flex items-center gap-2 overflow-hidden text-sm text-slate-300'>
              <Link href='/' className='flex shrink-0 items-center gap-1.5 transition hover:text-white'>
                <Home className='h-4 w-4' /> Home
              </Link>
              <ChevronRight className='h-4 w-4 shrink-0 text-slate-500' />
              <Link href='/courses' className='shrink-0 transition hover:text-white'>
                Courses
              </Link>
              <ChevronRight className='h-4 w-4 shrink-0 text-slate-500' />
              <span className='truncate text-orange-300'>{course.title}</span>
            </nav>
          </FadeIn>

          <div className='grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-12'>
            <FadeIn delay={80}>
              <div className='max-w-4xl pb-2 lg:py-6'>
                <div className='mb-5 flex flex-wrap items-center gap-2'>
                  {course.category && (
                    <span className='rounded-full border border-orange-300/30 bg-orange-400/15 px-3 py-1.5 text-xs font-semibold text-orange-200'>
                      {course.category}
                    </span>
                  )}
                  <span className='rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200'>
                    {course.level}
                  </span>
                  <span className='rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200'>
                    {course.language}
                  </span>
                </div>

                <h1 className='max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl'>
                  {course.title}
                </h1>

                <p className='mt-5 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base sm:leading-8'>
                  {courseDescriptionParsed.objective ||
                    courseDescriptionParsed.description ||
                    "Build practical skills through a structured course designed for focused learning."}
                </p>

                <div className='mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-200'>
                  <div className='flex items-center gap-2'>
                    <span className='font-bold text-orange-300'>{rating.toFixed(1)}</span>
                    <div className='flex items-center gap-0.5'>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(rating)
                              ? "fill-orange-400 text-orange-400"
                              : "fill-transparent text-slate-500"
                          }`}
                        />
                      ))}
                    </div>
                    <span className='text-slate-400'>({reviewCount} reviews)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4 text-orange-300' />
                    <span>{course.enrollmentCount.toLocaleString()} students</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CalendarDays className='h-4 w-4 text-orange-300' />
                    <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {course.courseInstructors.length > 0 && (
                  <div className='mt-7 flex items-center gap-3'>
                    <div className='flex -space-x-2'>
                      {course.courseInstructors.slice(0, 3).map(instructor => (
                        <div
                          key={instructor.instructorId}
                          className='relative h-10 w-10 overflow-hidden rounded-full border-2 border-[#062f58] bg-slate-700'
                        >
                          <Image
                            src={instructor.avatarUrl || "/default-avatar.png"}
                            alt={instructor.displayName}
                            fill
                            sizes='40px'
                            className='object-cover'
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className='text-xs text-slate-400'>Created by</p>
                      <p className='text-sm font-semibold text-white'>
                        {course.courseInstructors.map(item => item.displayName).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={140}>
              <div className='lg:hidden'>
                <CourseMedia
                  course={course}
                  videoData={videoData}
                  loading={videoDataLoading}
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-[1420px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10'>
        <div className='grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_410px]'>
          <div className='min-w-0 space-y-6'>
            <FadeIn>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                {courseIncludes.map(item => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.helper}
                      className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md'
                    >
                      <div className='mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600'>
                        <Icon className='h-4 w-4' />
                      </div>
                      <p className='text-base font-bold text-slate-900'>{item.label}</p>
                      <p className='mt-0.5 text-xs text-slate-500'>{item.helper}</p>
                    </div>
                  );
                })}
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <section className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'>
                <div className='sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-2 backdrop-blur sm:px-4'>
                  <div className='flex overflow-x-auto'>
                    {tabs.map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.label;
                      return (
                        <button
                          key={tab.label}
                          type='button'
                          onClick={() => setActiveTab(tab.label)}
                          className={`relative flex shrink-0 items-center gap-2 px-4 py-4 text-sm font-semibold transition sm:px-5 ${
                            isActive ? "text-[#074079]" : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${isActive ? "text-orange-500" : ""}`} />
                          {tab.label}
                          {tab.label === "Reviews" && (
                            <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600'>
                              {reviewCount}
                            </span>
                          )}
                          {isActive && (
                            <span className='absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-orange-500' />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className='p-5 sm:p-7 lg:p-8'>
                  {activeTab === "Overview" && <OverviewTab description={course.description} />}
                  {activeTab === "Curriculum" && (
                    <CurriculumTab
                      curriculum={course.modules}
                      expandedSections={expandedSections}
                      toggleSection={toggleSection}
                      totalLectures={course.content.totalLessons}
                      totalDuration={course.content.totalDuration}
                      getModalVideoData={getModalVideoData}
                    />
                  )}
                  {activeTab === "Instructor" && (
                    <InstructorTab instructors={course.courseInstructors} />
                  )}
                  {activeTab === "Reviews" && (
                    <ReviewsTab
                      reviews={course.reviews}
                      ratingAverage={rating}
                      ratingBreakdown={course.ratingBreakdown}
                    />
                  )}
                </div>
              </section>
            </FadeIn>
          </div>

          <aside className='lg:-mt-[255px] xl:-mt-[270px]'>
            <FadeIn delay={180}>
              <div className='sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10'>
                <div className='hidden lg:block p-2 pb-0'>
                  <CourseMedia course={course} videoData={videoData} loading={videoDataLoading} />
                </div>

                <div className='p-5 sm:p-6'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='text-3xl font-black tracking-tight text-[#074079]'>
                      {formatPrice(effectivePrice)}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className='text-base font-medium text-slate-400 line-through'>
                          {formatPrice(course.originalPrice)}
                        </span>
                        <span className='rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600'>
                          {course.discountPercent ??
                            Math.round(
                              ((course.originalPrice - Number(course.discountPrice)) /
                                course.originalPrice) *
                                100
                            )}
                          % OFF
                        </span>
                      </>
                    )}
                  </div>

                  {hasDiscount && remainingDays > 0 && (
                    <div className='mt-3 flex items-center gap-2 text-xs font-semibold text-rose-600'>
                      <Clock3 className='h-4 w-4' />
                      Offer ends in {remainingDays} day{remainingDays === 1 ? "" : "s"}
                    </div>
                  )}

                  <div className='mt-5 space-y-3'>
                    <GradientButton
                      size='md'
                      icon={ShoppingCart}
                      iconPosition='right'
                      className='w-full'
                      onClick={handleAddToCart}
                    >
                      Add To Cart
                    </GradientButton>

                    <Link href={`/checkout/${course.id}`} className='block'>
                      <BorderGradientButton className='w-full h-14 text-base font-bold' icon={CreditCard}>
                        Buy Now
                      </BorderGradientButton>
                    </Link>
                  </div>

                  <div className='mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700'>
                    <ShieldCheck className='h-4 w-4' />
                    Secure checkout
                  </div>

                  <div className='mt-6 border-t border-slate-100 pt-5'>
                    <h2 className='text-sm font-bold text-slate-900'>Course details</h2>
                    <div className='mt-4 space-y-3'>
                      <InfoRow icon={Clock3} label='Duration' value={formatDuration(course.content.totalDuration)} />
                      <InfoRow icon={ListVideo} label='Lessons' value={`${course.content.totalLessons}`} />
                      <InfoRow icon={Languages} label='Language' value={course.language} />
                      <InfoRow icon={Sparkles} label='Level' value={course.level} />
                    </div>
                  </div>

                  <div className='mt-6 grid grid-cols-2 gap-2 border-t border-slate-100 pt-5'>
                    <button
                      type='button'
                      onClick={handleWishlist}
                      disabled={!user?.id || wishlistLoading}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        isInWishlist
                          ? "border-rose-200 bg-rose-50 text-rose-600"
                          : "border-slate-200 text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                      }`}
                    >
                      {wishlistLoading ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
                      )}
                      {isInWishlist ? "Wishlisted" : "Wishlist"}
                    </button>
                    <button
                      type='button'
                      onClick={shareCourse}
                      className='flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600'
                    >
                      {copied ? <Check className='h-4 w-4' /> : <Share2 className='h-4 w-4' />}
                      {copied ? "Copied" : "Share"}
                    </button>
                  </div>

                  <div className='mt-5 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3'>
                    <span className='text-xs font-medium text-slate-500'>Share with</span>
                    <div className='flex items-center gap-1'>
                      <SocialButton label='Facebook' onClick={() => openSocialShare("facebook")}>
                        <Facebook className='h-4 w-4' />
                      </SocialButton>
                      <SocialButton label='Twitter' onClick={() => openSocialShare("twitter")}>
                        <Twitter className='h-4 w-4' />
                      </SocialButton>
                      <SocialButton label='LinkedIn' onClick={() => openSocialShare("linkedin")}>
                        <Linkedin className='h-4 w-4' />
                      </SocialButton>
                      <SocialButton label='Copy link' onClick={shareCourse}>
                        <Copy className='h-4 w-4' />
                      </SocialButton>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </aside>
        </div>
      </section>

      {isModalOpen && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm'
          onClick={() => {
            setIsModalOpen(false);
            setModalVideoData(null);
          }}
        >
          <div
            className='relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl'
            onClick={event => event.stopPropagation()}
          >
            <button
              type='button'
              onClick={() => {
                setIsModalOpen(false);
                setModalVideoData(null);
              }}
              className='absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-orange-500'
              aria-label='Close video preview'
            >
              <X className='h-5 w-5' />
            </button>

            <div className='aspect-video w-full'>
              {modalVideoLoading || !modalVideoData ? (
                <div className='flex h-full items-center justify-center gap-3 bg-slate-950 text-sm font-semibold text-white'>
                  <Loader2 className='h-6 w-6 animate-spin text-orange-400' />
                  Loading preview...
                </div>
              ) : (
                <iframe
                  title='Course lesson preview'
                  className='h-full w-full'
                  src={`https://iframe.mediadelivery.net/embed/${modalVideoData.libraryId}/${modalVideoData.videoId}?token=${modalVideoData.token}&expires=${modalVideoData.expiresAt}&autoplay=true`}
                  allow='accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;'
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function CourseMedia({
  course,
  videoData,
  loading,
}: {
  course: CourseDetailsPublic;
  videoData: VideoData;
  loading: boolean;
}) {
  return (
    <div className='relative aspect-video overflow-hidden rounded-2xl bg-slate-900'>
      {loading ? (
        <div className='flex h-full items-center justify-center gap-2 text-sm font-semibold text-white'>
          <Loader2 className='h-5 w-5 animate-spin text-orange-400' /> Loading preview...
        </div>
      ) : videoData ? (
        <iframe
          title={`${course.title} trailer`}
          className='h-full w-full'
          src={`https://iframe.mediadelivery.net/embed/${videoData.libraryId}/${videoData.videoId}?token=${videoData.token}&expires=${videoData.expiresAt}&autoplay=false`}
          allow='accelerometer; gyroscope; encrypted-media; picture-in-picture;'
          allowFullScreen
        />
      ) : (
        <>
          <Image
            src={course.thumbnailUrl || "/images/course-placeholder.png"}
            alt={course.title}
            fill
            sizes='(max-width: 1024px) 100vw, 430px'
            className='object-cover opacity-90'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent' />
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/90 text-orange-600 shadow-xl'>
              <Play className='ml-0.5 h-5 w-5 fill-current' />
            </div>
          </div>
          <span className='absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur'>
            Course preview
          </span>
        </>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className='flex items-center justify-between gap-4 text-sm'>
      <span className='flex items-center gap-2 text-slate-500'>
        <Icon className='h-4 w-4 text-orange-500' /> {label}
      </span>
      <span className='font-semibold text-slate-800'>{value}</span>
    </div>
  );
}

function SocialButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-orange-600 hover:shadow-sm'
    >
      {children}
    </button>
  );
}
