"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Tracks whether an element is intersecting the viewport, via a plain
 * IntersectionObserver (no polling, no scroll listeners). Used to pause
 * the hero's 3D render loop entirely once it's scrolled out of view.
 */
export function useInView<T extends HTMLElement>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
}
