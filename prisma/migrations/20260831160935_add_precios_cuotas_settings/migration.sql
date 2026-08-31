-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "cantidadCuotas" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "cuotasSinInteres" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "descuentoTransferencia" INTEGER,
ADD COLUMN     "mostrarPrecioSinImpuestos" BOOLEAN NOT NULL DEFAULT false;
