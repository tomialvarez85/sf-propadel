"use client";

import { useCallback, useEffect, useState } from "react";

export type CartVariant = { tipo: string; valor: string };

export type CartItem = {
  lineId: string;
  productId: string;
  nombre: string;
  slug: string;
  precio: number;
  imagen: string | null;
  variants: CartVariant[];
  quantity: number;
};

export type CartLineInput = {
  productId: string;
  nombre: string;
  slug: string;
  precio: number;
  imagen: string | null;
  variants?: CartVariant[];
  quantity?: number;
};

const STORAGE_KEY = "sf-propadel-cart";
const CHANGE_EVENT = "sf-propadel-cart-change";

function buildLineId(productId: string, variants: CartVariant[]) {
  const signature = variants
    .map((variant) => `${variant.tipo}:${variant.valor}`)
    .sort()
    .join("|");
  return signature ? `${productId}::${signature}` : productId;
}

function readItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeItems(items: CartItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Cart persisted entirely in localStorage (no backend), same architecture as
 * useWishlist: full product-line snapshots (not just ids), a custom
 * window event plus "storage" to keep every mounted instance (header badge,
 * cart sheet, product pages) in sync.
 *
 * A cart line is identified by `lineId` = productId + a sorted signature of
 * its selected variants, so the same product added with different
 * variants (e.g. two sizes) becomes two separate lines, while adding the
 * same product+variant combo twice merges into one line with quantity+1.
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
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

  const addItem = useCallback((input: CartLineInput) => {
    const variants = input.variants ?? [];
    const lineId = buildLineId(input.productId, variants);
    const quantity = input.quantity ?? 1;
    const current = readItems();
    const existing = current.find((item) => item.lineId === lineId);

    const next = existing
      ? current.map((item) =>
          item.lineId === lineId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      : [
          ...current,
          {
            lineId,
            productId: input.productId,
            nombre: input.nombre,
            slug: input.slug,
            precio: input.precio,
            imagen: input.imagen,
            variants,
            quantity,
          },
        ];

    writeItems(next);
    setItems(next);
  }, []);

  const removeItem = useCallback((lineId: string) => {
    const next = readItems().filter((item) => item.lineId !== lineId);
    writeItems(next);
    setItems(next);
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    const current = readItems();
    const next =
      quantity <= 0
        ? current.filter((item) => item.lineId !== lineId)
        : current.map((item) =>
            item.lineId === lineId ? { ...item, quantity } : item,
          );
    writeItems(next);
    setItems(next);
  }, []);

  const clearCart = useCallback(() => {
    writeItems([]);
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.precio * item.quantity,
    0,
  );

  return {
    items,
    hydrated,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };
}
