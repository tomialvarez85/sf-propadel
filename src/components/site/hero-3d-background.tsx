"use client";

import dynamic from "next/dynamic";

import { useHero3DCapability } from "@/hooks/use-hero-3d-capability";
import { useInView } from "@/hooks/use-in-view";

const Hero3DScene = dynamic(
  () =>
    import("@/components/site/hero-3d-scene").then((mod) => mod.Hero3DScene),
  { ssr: false },
);

/**
 * The container mounts unconditionally (so the IntersectionObserver ref is
 * always attached) — only the actual Canvas/Three.js bundle is conditional.
 * Devices that fail the capability check (see useHero3DCapability) never
 * import three.js/@react-three/fiber at all; the existing flat hero (photo
 * + the small CSS ball-bounce) is the fallback, not a separate static asset.
 */
export function Hero3DBackground() {
  const canRender = useHero3DCapability();
  const [containerRef, isInView] = useInView<HTMLDivElement>();

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10"
    >
      {canRender && <Hero3DScene isActive={isInView} />}
    </div>
  );
}
