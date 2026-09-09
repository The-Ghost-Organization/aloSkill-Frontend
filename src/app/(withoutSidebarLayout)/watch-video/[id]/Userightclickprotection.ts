"use client";

import { useEffect } from "react";

interface UseRightClickProtectionOptions {
  /** Disable during development. Default: false */
  disabled?: boolean;
  /** Optional callback fired on every blocked right-click attempt */
  onAttempt?: (e: MouseEvent) => void;
}

/**
 * useRightClickProtection
 *
 * Attaches a `contextmenu` listener to the document in the capture phase
 * (third argument `true`) so it intercepts the event before it reaches
 * any child element — including iframes that have their own listeners.
 *
 * Capture phase is critical: bubble-phase listeners on `document` fire
 * AFTER child handlers and can be stopped by them. Capture phase fires first,
 * always, regardless of what the child does.
 */
export function useRightClickProtection({
  disabled = false,
  onAttempt,
}: UseRightClickProtectionOptions = {}) {
  useEffect(() => {
    if (disabled) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onAttempt?.(e);
    };

    // `true` = capture phase — fires before any child handler
    document.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, [disabled, onAttempt]);
}
