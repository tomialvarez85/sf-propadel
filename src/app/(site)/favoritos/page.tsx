import type { Metadata } from "next";

import { FavoritesList } from "@/components/site/favorites-list";

export const metadata: Metadata = {
  title: "Favoritos | SF ProPadel",
};

export default function FavoritosPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Tus favoritos
      </h1>
      <FavoritesList />
    </div>
  );
}
