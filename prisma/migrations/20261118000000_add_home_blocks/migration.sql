-- Restos de un intento anterior creado a mano en Supabase (nunca registrado
-- como migración de Prisma y sin uso en el código). Se descartan para crear
-- la tabla limpia; solo contenían filas de ejemplo.
DROP TABLE IF EXISTS "HomeBlock";
DROP TYPE IF EXISTS "HomeBlockTipo";

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

-- Contenido inicial: el primer slide es el banner actual (antes fijo en el
-- código) y las tarjetas Paletas / Bolsos / Accesorios apuntan a sus
-- categorías. Paletas y Bolsos arrancan con las fotos de los viejos tiles
-- Hombre/Mujer como placeholder: se reemplazan desde /admin/banners.
INSERT INTO "HomeBlock" ("id", "tipo", "titulo", "imagen", "link", "orden") VALUES
  ('seed-banner-1', 'BANNER', 'Nueva colección de paletas 2026', '/hero/banner-principal.jpg', '/productos?categoria=paletas', 0),
  ('seed-tile-paletas', 'TILE', 'Paletas', '/tiles/hombre.jpg', '/paletas', 0),
  ('seed-tile-bolsos', 'TILE', 'Bolsos', '/tiles/mujer.jpg', '/bolsos', 1),
  ('seed-tile-accesorios', 'TILE', 'Accesorios', '/tiles/accesorios.jpg', '/accesorios', 2);
