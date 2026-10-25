"use client";

import { useEffect, useRef, useState } from 'react';

interface Player {
  getCurrentTime(): number; getDuration(): number; getPlayerState(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void; destroy(): void;
}
interface PlayerOptions {
  videoId: string; width: string; height: string;
  playerVars: { controls: number; playsinline: number; origin: string; fs: number };
  events: { onReady: () => void; onError: (event: { data: number }) => void; onStateChange: (event: { data: number }) => void };
}
type YouTubeWindow = Window & { YT?: { Player: new (element: HTMLElement, options: PlayerOptions) => Player }; onYouTubeIframeAPIReady?: () => void };
let apiPromise: Promise<NonNullable<YouTubeWindow['YT']>> | undefined;
function loadAPI(): Promise<NonNullable<YouTubeWindow['YT']>> {
  const target = window as YouTubeWindow;
  if (target.YT?.Player) return Promise.resolve(target.YT);
  if (!apiPromise) apiPromise = new Promise((resolve, reject) => {
    const previous = target.onYouTubeIframeAPIReady;
    const timeout = setTimeout(() => { apiPromise = undefined; reject(new Error('Video player could not load. Refresh to retry.')); }, 30_000);
    target.onYouTubeIframeAPIReady = () => {
      previous?.(); clearTimeout(timeout);
      if (target.YT) resolve(target.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api'; script.async = true;
    script.onerror = () => { clearTimeout(timeout); apiPromise = undefined; reject(new Error('Video player could not load. Check your connection.')); };
    document.head.appendChild(script);
  });
  return apiPromise;
}

export default function YouTubeVideoPlayer({ videoId, lessonId, lastPosition, handleUpdateProgress, onEnded }: {
  videoId: string; lessonId: string; lastPosition: number;
  handleUpdateProgress: (value: { lessonId: string; lastPosition: number; progressValue: number; isFinished: boolean }) => void;
  onEnded?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ handleUpdateProgress, onEnded });
  callbacks.current = { handleUpdateProgress, onEnded };
  const resume = useRef(lastPosition);
  resume.current = lastPosition;
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let disposed = false;
    let player: Player | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    let ended = false;
    let initialized = false;
    setError(''); setReady(false);
    const save = (finished = false) => {
      if (!player || !initialized || (ended && !finished)) return;
      const duration = player.getDuration();
      if (!Number.isFinite(duration) || duration <= 0) return;
      callbacks.current.handleUpdateProgress({ lessonId, lastPosition: finished ? 0 : Math.floor(player.getCurrentTime()),
        progressValue: finished ? 100 : Math.min(100, player.getCurrentTime() / duration * 100), isFinished: finished });
    };
    void loadAPI().then(api => {
      if (disposed || !host.current) return;
      const element = document.createElement('div');
      host.current.replaceChildren(element);
      player = new api.Player(element, {
        videoId, width: '100%', height: '100%',
        playerVars: { controls: 1, playsinline: 1, origin: window.location.origin, fs: 1 },
        events: {
          onReady: () => {
            if (disposed) return;
            initialized = true; setReady(true);
            if (resume.current > 0) player?.seekTo(resume.current, true);
            timer = setInterval(() => { if (player?.getPlayerState() === 1) save(); }, 10_000);
          },
          onStateChange: event => {
            if (event.data === 2) save();
            if (event.data === 0 && !ended) { save(true); ended = true; callbacks.current.onEnded?.(); }
          },
          onError: event => setError(`This lesson video is unavailable (code ${event.data}). Please contact support.`),
        },
      });
    }).catch((reason: unknown) => { if (!disposed) setError(reason instanceof Error ? reason.message : 'Video player could not load.'); });
    return () => { disposed = true; if (timer) clearInterval(timer); save(); player?.destroy(); };
  }, [videoId, lessonId]);
  return <div className='relative h-full w-full bg-black' style={{ minHeight: 200 }}>
    <div ref={host} className='h-full w-full' style={{ minHeight: 200 }} />
    {/* Status stays outside the iframe; no overlays cover branding or controls. */}
    {error ? <p role='alert' className='bg-white p-3 text-sm text-red-700'>{error}</p> : !ready ? <p role='status' className='bg-white p-2 text-sm'>Loading lesson video…</p> : null}
  </div>;
}
