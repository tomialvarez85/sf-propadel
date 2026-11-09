import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { HomeBlockList } from "@/components/admin/home-block-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getHomeBlockList, MAX_HOME_TILES } from "@/lib/home-blocks";

export const metadata: Metadata = {
  title: "Inicio | SF ProPadel Admin",
};

export default async function AdminInicioPage() {
  const [banners, tiles] = await Promise.all([
    getHomeBlockList("BANNER"),
    getHomeBlockList("TILE"),
  ]);
  const activeTiles = tiles.filter((tile) => tile.activo).length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Página de inicio
      </h1>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Banner principal</CardTitle>
            <CardDescription>
              Las imágenes grandes de arriba de todo. Si hay más de una visible,
              van pasando solas como carrusel (recomendado: 3 o 4).
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/inicio/nuevo?tipo=BANNER">
              <Plus className="size-4" />
              Nuevo slide
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <HomeBlockList
            blocks={banners}
            emptyText="No hay slides. El home se muestra sin banner."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Categorías destacadas</CardTitle>
            <CardDescription>
              Las {MAX_HOME_TILES} tarjetas con foto debajo del banner. Se
              muestran las primeras {MAX_HOME_TILES} visibles, en este orden.
              Pueden llevar a una categoría, a un producto o a cualquier página
              del sitio.
            </CardDescription>
            {activeTiles > MAX_HOME_TILES && (
              <p className="text-sm font-medium text-amber-700">
                Hay {activeTiles} visibles: solo se muestran las primeras{" "}
                {MAX_HOME_TILES}.
              </p>
            )}
          </div>
          <Button asChild>
            <Link href="/admin/inicio/nuevo?tipo=TILE">
              <Plus className="size-4" />
              Nueva tarjeta
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <HomeBlockList
            blocks={tiles}
            emptyText="No hay tarjetas. La sección no se muestra en el home."
          />
        </CardContent>
      </Card>
    </div>
  );
}
