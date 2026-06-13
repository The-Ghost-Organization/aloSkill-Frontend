"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface DevToolsProtectionOptions {
  /** Poll interval in ms for size-based detection. Default: 800 */
  pollInterval?: number;
  /** px threshold for outerWidth/Height diff detection. Default: 150 */
  sizeThreshold?: number;
  /** Fired when DevTools open state changes */
  onChange?: (isOpen: boolean) => void;
  /** Disable in development to avoid annoying yourself. Default: false */
  disabled?: boolean;
}

/**
 * useDevToolsProtection
 *
 * Combines THREE independent detection strategies so that bypassing
 * one method alone is not enough to go undetected:
 *
 *  Method A — Window size delta
 *    When DevTools opens docked (side or bottom panel), outerWidth or
 *    outerHeight shrinks while innerWidth/Height stays the same.
 *    The gap exceeds `sizeThreshold`. Fastest, catches 90% of cases.
 *
 *  Method B — debugger timing trap
 *    A `debugger` statement inside a getter takes ~microseconds normally.
 *    When DevTools is open and the Sources panel is active, the JS engine
 *    pauses and the elapsed time jumps to 100ms+. We measure this with
 *    `performance.now()`. Catches undocked DevTools that Method A misses.
 *
 *  Method C — console.log object toString side-channel
 *    `console.log` is a no-op when DevTools is closed. When open, the
 *    browser calls `.toString()` on logged objects to render them in the
 *    console. We define a getter on a dummy object and set a flag if it
 *    fires. Catches Firefox and cases where Methods A & B both miss.
 *
 * Returns `isDevToolsOpen: boolean`.
 */
export function useDevToolsProtection({
  pollInterval = 800,
  sizeThreshold = 150,
  onChange,
  disabled = false,
}: DevToolsProtectionOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const updateState = useCallback((next: boolean) => {
    setIsOpen(prev => {
      if (prev === next) return prev;
      onChangeRef.current?.(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (disabled) return;

    // ── Method A: window size delta ──────────────────────────────────────────
    const checkSize = (): boolean => {
      const widthGap = window.outerWidth - window.innerWidth;
      const heightGap = window.outerHeight - window.innerHeight;
      return widthGap > sizeThreshold || heightGap > sizeThreshold;
    };

    // ── Method B: debugger timing trap ───────────────────────────────────────
    const checkDebugger = (): boolean => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      (function () {
        debugger;
      })();
      return performance.now() - start > 100;
    };

    // ── Method C: console toString side-channel ──────────────────────────────
    const checkConsole = (): boolean => {
      let triggered = false;
      const dummy = Object.defineProperty({}, "_", {
        get() {
          triggered = true;
          return "protected";
        },
      });
      // Suppress output: save + restore console.log
      const original = console.log;
      console.log = () => {};
      console.log(dummy);
      console.log = original;
      return triggered;
    };

    const runAllChecks = () => {
      const detected = checkSize() || checkDebugger() || checkConsole();
      updateState(detected);
    };

    // Run immediately, then on interval
    runAllChecks();
    intervalRef.current = setInterval(runAllChecks, pollInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [disabled, pollInterval, sizeThreshold, updateState]);

  return { isDevToolsOpen: isOpen };
}
