"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

// Usage examples:
// const isMobile = useMediaQuery('(max-width: 768px)');
// const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
// const isDesktop = useMediaQuery('(min-width: 1024px)');
