"use client";

import { useEffect, useState } from "react";

const MIN_VIEWPORT_WIDTH = 768; // matches Tailwind's `md` breakpoint
const MIN_CPU_CORES = 4;

/**
 * Whether the hero's 3D background should render at all. `null` while
 * undetermined (server render / before mount) so callers can render nothing
 * rather than flash the wrong state. Deliberately conservative: reduced
 * motion, small viewports, and low core-count devices all fall back to the
 * existing flat hero (photo + the small CSS ball-bounce), never the 3D
 * canvas — mobile is most of this site's real traffic, so the default has
 * to be "skip it" unless the device clearly has room to spare.
 */
export function useHero3DCapability(): boolean | null {
  const [canRender, setCanRender] = useState<boolean | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isSmallViewport = window.innerWidth < MIN_VIEWPORT_WIDTH;
    const cores = navigator.hardwareConcurrency;
    const isLowEndCpu = typeof cores === "number" && cores < MIN_CPU_CORES;

    setCanRender(!prefersReducedMotion && !isSmallViewport && !isLowEndCpu);
  }, []);

  return canRender;
}
