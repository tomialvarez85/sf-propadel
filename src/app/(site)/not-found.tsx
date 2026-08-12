import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function SiteNotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-24 text-center">
      <span className="text-primary text-sm font-semibold">Error 404</span>
      <h1 className="text-3xl font-semibold tracking-tight">
        No encontramos esta página
      </h1>
      <p className="text-muted-foreground max-w-md">
        El producto, la categoría o la página que buscás no existe o ya no está
        disponible.
      </p>
      <div className="mt-2 flex gap-3">
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/productos">Ver productos</Link>
        </Button>
      </div>
    </div>
  );
}
