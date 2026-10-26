"use client";

import { useEffect, useRef, useState } from "react";

interface Player {
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  destroy(): void;
  getIframe(): HTMLIFrameElement;
}
interface PlayerOptions {
  videoId: string;
  width: string;
  height: string;
  playerVars: { controls: number; playsinline: number; origin: string; fs: number; rel: number };
  events: {
    onReady: () => void;
    onError: (event: { data: number }) => void;
    onStateChange: (event: { data: number }) => void;
  };
}
type YouTubeWindow = Window & {
  YT?: { Player: new (element: HTMLElement, options: PlayerOptions) => Player };
  onYouTubeIframeAPIReady?: () => void;
};
let apiPromise: Promise<NonNullable<YouTubeWindow["YT"]>> | undefined;
export function youtubeErrorMessage(code: number): string {
  if (code === 100) return "This video was removed or is private. Please contact course support.";
  if (code === 101 || code === 150)
    return "The video owner has disabled playback on this website. Please contact course support.";
  if (code === 153)
    return "YouTube could not identify this website. Please contact support to check the player configuration.";
  if (code === 5)
    return "Your browser could not play this video. Try again or use another browser.";
  return `This lesson video is unavailable (code ${code}). Please try again or contact course support.`;
}
function loadAPI(): Promise<NonNullable<YouTubeWindow["YT"]>> {
  const target = window as YouTubeWindow;
  if (target.YT?.Player) return Promise.resolve(target.YT);
  if (!apiPromise)
    apiPromise = new Promise((resolve, reject) => {
      const previous = target.onYouTubeIframeAPIReady;
      const script = document.createElement("script");
      const fail = (message: string) => {
        clearTimeout(timeout);
        script.remove();
        if (target.onYouTubeIframeAPIReady === onReady) target.onYouTubeIframeAPIReady = previous;
        apiPromise = undefined;
        reject(new Error(message));
      };
      const timeout = setTimeout(
        () => fail("Video player could not load. Select Retry to try again."),
        30_000
      );
      const onReady = () => {
        clearTimeout(timeout);
        if (target.onYouTubeIframeAPIReady === onReady) target.onYouTubeIframeAPIReady = previous;
        if (target.YT?.Player) resolve(target.YT);
        else fail("Video player could not initialize. Select Retry to try again.");
        previous?.();
      };
      target.onYouTubeIframeAPIReady = onReady;
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () =>
        fail("Video player could not load. Check your connection and select Retry.");
      document.head.appendChild(script);
    });
  return apiPromise;
}

export default function YouTubeVideoPlayer({
  videoId,
  lessonId,
  lastPosition,
  handleUpdateProgress,
  onEnded,
}: {
  videoId: string;
  lessonId: string;
  lastPosition: number;
  handleUpdateProgress: (value: {
    lessonId: string;
    lastPosition: number;
    progressValue: number;
    isFinished: boolean;
  }) => void;
  onEnded?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ handleUpdateProgress, onEnded });
  callbacks.current = { handleUpdateProgress, onEnded };
  const resume = useRef(lastPosition);
  resume.current = lastPosition;
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    let disposed = false;
    let player: Player | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    let ended = false;
    let initialized = false;
    setError("");
    setReady(false);
    setFinished(false);
    const save = (finished = false) => {
      if (!player || !initialized || (ended && !finished)) return;
      const duration = player.getDuration();
      if (!Number.isFinite(duration) || duration <= 0) return;
      const position = player.getCurrentTime();
      if (!Number.isFinite(position)) return;
      callbacks.current.handleUpdateProgress({
        lessonId,
        lastPosition: finished ? 0 : Math.max(0, Math.floor(position)),
        progressValue: finished ? 100 : Math.max(0, Math.min(100, (position / duration) * 100)),
        isFinished: finished,
      });
    };
    void loadAPI()
      .then(api => {
        if (disposed || !host.current) return;
        const element = document.createElement("div");
        host.current.replaceChildren(element);
        player = new api.Player(element, {
          videoId,
          width: "100%",
          height: "100%",
          // rel=0 limits recommendations to this channel; YouTube still controls
          // branding, sharing and recommendations. Deprecated hiding flags do nothing.
          playerVars: {
            controls: 1,
            playsinline: 1,
            origin: window.location.origin,
            fs: 1,
            rel: 0,
          },
          events: {
            onReady: () => {
              if (disposed) return;
              initialized = true;
              setReady(true);
              const iframe = player?.getIframe();
              if (iframe) {
                iframe.title = "Course lesson video";
                iframe.referrerPolicy = "strict-origin-when-cross-origin";
              }
              if (resume.current > 0) player?.seekTo(resume.current, true);
              timer = setInterval(() => {
                if (player?.getPlayerState() === 1) save();
              }, 10_000);
            },
            onStateChange: event => {
              if (disposed) return;
              if (event.data === 2) save();
              if (event.data === 0 && !ended) {
                save(true);
                ended = true;
                setFinished(true);
                callbacks.current.onEnded?.();
              }
              if (event.data === 1 && ended) {
                ended = false;
                setFinished(false);
              }
            },
            onError: event => {
              if (!disposed) setError(youtubeErrorMessage(event.data));
            },
          },
        });
      })
      .catch((reason: unknown) => {
        if (!disposed)
          setError(reason instanceof Error ? reason.message : "Video player could not load.");
      });
    return () => {
      disposed = true;
      if (timer) clearInterval(timer);
      save();
      player?.destroy();
    };
  }, [videoId, lessonId, attempt]);
  return (
    <div className='w-full bg-black'>
      <div className='aspect-video min-h-[200px]'>
        <div
          ref={host}
          className='h-full w-full'
          style={{ minHeight: 200 }}
        />
      </div>
      {/* Status stays outside the iframe; no overlays cover branding or controls. */}
      {error ? (
        <div
          role='alert'
          className='flex flex-wrap items-center justify-between gap-3 bg-red-50 p-4 text-sm text-red-700'
        >
          <p>{error}</p>
          <button
            type='button'
            onClick={() => setAttempt(value => value + 1)}
            className='rounded border border-red-300 px-3 py-2 font-medium'
          >
            Retry video
          </button>
        </div>
      ) : !ready ? (
        <p
          role='status'
          className='bg-white p-3 text-sm'
        >
          Loading lesson video…
        </p>
      ) : finished ? (
        <p
          role='status'
          className='bg-green-50 p-3 text-sm text-green-800'
        >
          Video finished. Use Next Lecture to continue when your progress is saved.
        </p>
      ) : null}
    </div>
  );
}
