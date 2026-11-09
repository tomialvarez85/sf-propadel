-- CreateEnum
CREATE TYPE "HomeBlockTipo" AS ENUM ('BANNER', 'TILE');

-- CreateTable
CREATE TABLE "HomeBlock" (
    "id" TEXT NOT NULL,
    "tipo" "HomeBlockTipo" NOT NULL,
    "titulo" TEXT,
    "imagen" TEXT NOT NULL,
    "imagenMobile" TEXT,
    "link" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomeBlock_tipo_activo_orden_idx" ON "HomeBlock"("tipo", "activo", "orden");

-- Contenido inicial: el banner y las imágenes que hasta ahora estaban fijas
-- en el código (/public), para que el home no quede vacío al deployar. Se
-- reemplazan desde /admin/inicio. Paletas y Bolsos arrancan con las fotos
-- de los viejos tiles Hombre/Mujer como placeholder hasta subir las reales.
INSERT INTO "HomeBlock" ("id", "tipo", "titulo", "imagen", "link", "orden") VALUES
  ('seed-banner-1', 'BANNER', 'Nueva colección de paletas 2026', '/hero/banner-principal.jpg', '/productos?categoria=paletas', 0),
  ('seed-tile-paletas', 'TILE', 'Paletas', '/tiles/hombre.jpg', '/productos?categoria=paletas', 0),
  ('seed-tile-bolsos', 'TILE', 'Bolsos', '/tiles/mujer.jpg', '/productos?categoria=bolsos', 1),
  ('seed-tile-accesorios', 'TILE', 'Accesorios', '/tiles/accesorios.jpg', '/productos?categoria=accesorios', 2);
