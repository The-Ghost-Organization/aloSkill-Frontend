
"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type Props = {
  videoId: string;
  token: string;
};

export default function BunnyVideoPlayer({ videoId, token }: Props) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!(window as any)?.BunnyPlayer) return;
    if (!scriptLoaded || !containerRef.current || playerRef.current) return;

    playerRef.current = new (window as any).BunnyPlayer({
      container: containerRef.current,
      video: videoId,
      token,
      autoplay: false,
      controls: true,
    });

    return () => {
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [scriptLoaded, videoId, token]);

  return (
    <>
      <Script
        src='//assets.mediadelivery.net/playerjs/playerjs-latest.min.js'
        strategy='afterInteractive'
        onLoad={() => setScriptLoaded(true)}
      />

      <div
        ref={containerRef}
        className='w-full aspect-video bg-black'
      />
    </>
  );
}
