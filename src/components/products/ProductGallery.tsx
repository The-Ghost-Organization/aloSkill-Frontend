"use client";

import { ChevronLeft, ChevronRight, ImageOff, ZoomIn } from "lucide-react";
import { type KeyboardEvent, type MouseEvent, useRef, useState } from "react";

const SWIPE_THRESHOLD_PX = 40;

/**
 * Image gallery: main image with hover-zoom (pointer devices), prev/next
 * controls, keyboard ←/→, touch swipe, and a selectable thumbnail strip.
 */
export default function ProductGallery({
  images,
  title,
  dimmed = false,
}: {
  images: string[];
  title: string;
  /** Greys the image out (used for out-of-stock products). */
  dimmed?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const touchStartX = useRef<number | null>(null);

  const count = images.length;
  const current = images[active];
  const go = (index: number) => {
    if (!count) return;
    setActive((index + count) % count);
    setZoom(null);
  };
  const markFailed = (url: string) =>
    setFailed(prev => (prev.has(url) ? prev : new Set(prev).add(url)));

  /**
   * SSR'd images can fail before hydration, so React never sees their `error`
   * event. On mount, treat an already-finished image with no pixels as failed.
   */
  const detectEarlyFailure = (url: string) => (img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth === 0) markFailed(url);
  };

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (count < 2) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(active - 1);
    }
  };

  const showImage = current && !failed.has(current);

  return (
    <div className='space-y-3'>
      {/* ── Main image ── */}
      <div
        role='group'
        aria-roledescription='carousel'
        aria-label={`${title} images`}
        tabIndex={count > 1 ? 0 : -1}
        onKeyDown={onKeyDown}
        onTouchStart={e => (touchStartX.current = e.touches[0]?.clientX ?? null)}
        onTouchEnd={e => {
          const start = touchStartX.current;
          const end = e.changedTouches[0]?.clientX;
          touchStartX.current = null;
          if (start == null || end == null) return;
          if (start - end > SWIPE_THRESHOLD_PX) go(active + 1);
          else if (end - start > SWIPE_THRESHOLD_PX) go(active - 1);
        }}
        className='group relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange'
      >
        {showImage ? (
          <div
            className='h-full w-full cursor-zoom-in'
            onMouseMove={onMouseMove}
            onMouseLeave={() => setZoom(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote instructor uploads */}
            <img
              key={current}
              ref={detectEarlyFailure(current)}
              src={current}
              alt={count > 1 ? `${title}, image ${active + 1} of ${count}` : title}
              decoding='async'
              fetchPriority='high'
              onError={() => markFailed(current)}
              style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              className={`h-full w-full object-contain p-4 transition-transform duration-200 ease-out sm:p-8 ${
                zoom ? "scale-[1.8]" : "scale-100"
              } ${dimmed ? "opacity-60 grayscale" : ""}`}
            />
          </div>
        ) : (
          <div className='flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-50 text-slate-300'>
            <ImageOff
              className='h-12 w-12'
              aria-hidden='true'
            />
            <span className='text-xs text-slate-400'>Image unavailable</span>
          </div>
        )}

        {showImage && (
          <span className='pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-gray-500 shadow-sm transition-opacity group-hover:opacity-0 md:flex'>
            <ZoomIn
              className='h-3 w-3'
              aria-hidden='true'
            />{" "}
            Hover to zoom
          </span>
        )}

        {count > 1 && (
          <>
            <button
              type='button'
              onClick={() => go(active - 1)}
              aria-label='Previous image'
              className='absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy shadow-md transition hover:bg-white hover:text-orange-dark md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100'
            >
              <ChevronLeft className='h-5 w-5' />
            </button>
            <button
              type='button'
              onClick={() => go(active + 1)}
              aria-label='Next image'
              className='absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy shadow-md transition hover:bg-white hover:text-orange-dark md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100'
            >
              <ChevronRight className='h-5 w-5' />
            </button>
            {/* Dots — mobile only (thumbnails take over on larger screens) */}
            <div className='absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden'>
              {images.map((url, i) => (
                <span
                  key={url}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active ? "w-5 bg-orange" : "w-1.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <p
              className='sr-only'
              aria-live='polite'
            >
              Image {active + 1} of {count}
            </p>
          </>
        )}
      </div>

      {/* ── Thumbnails ── */}
      {count > 1 && (
        <div
          className='hidden gap-3 overflow-x-auto pb-1 sm:flex'
          aria-label='Choose image'
        >
          {images.map((url, i) => {
            const selected = i === active;
            return (
              <button
                key={url}
                type='button'
                onClick={() => go(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={selected ? "true" : undefined}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${
                  selected
                    ? "border-orange shadow-sm"
                    : "border-gray-100 opacity-70 hover:border-orange-light hover:opacity-100"
                }`}
              >
                {failed.has(url) ? (
                  <ImageOff
                    className='m-auto h-5 w-5 text-slate-300'
                    aria-hidden='true'
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- remote instructor uploads
                  <img
                    ref={detectEarlyFailure(url)}
                    src={url}
                    alt=''
                    loading='lazy'
                    decoding='async'
                    onError={() => markFailed(url)}
                    className='h-full w-full object-contain p-1.5'
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
