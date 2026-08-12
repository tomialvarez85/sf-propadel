"use client";

import { useCallback, useEffect, useState } from "react";

import type { ProductCardData } from "@/components/site/product-card";

export type WishlistItem = ProductCardData;

const STORAGE_KEY = "sf-propadel-wishlist";
const CHANGE_EVENT = "sf-propadel-wishlist-change";

function readItems(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

function writeItems(items: WishlistItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Wishlist persisted entirely in localStorage (no backend). Stores full
 * product-card snapshots rather than just ids so /favoritos can render
 * without an extra data fetch. `window.dispatchEvent`/"storage" keep every
 * mounted instance (header badge, product cards, /favoritos) in sync.
 */
export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readItems());
    setHydrated(true);

    const sync = () => setItems(readItems());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isFavorite = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items],
  );

  const toggle = useCallback((product: WishlistItem) => {
    const current = readItems();
    const next = current.some((item) => item.id === product.id)
      ? current.filter((item) => item.id !== product.id)
      : [...current, product];
    writeItems(next);
    setItems(next);
  }, []);

  const remove = useCallback((id: string) => {
    const next = readItems().filter((item) => item.id !== id);
    writeItems(next);
    setItems(next);
  }, []);

  return { items, hydrated, isFavorite, toggle, remove };
}
