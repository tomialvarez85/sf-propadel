-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "descuentoEfectivoOverride" INTEGER,
ADD COLUMN     "descuentoTransferenciaOverride" INTEGER;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "descuentoEfectivo" INTEGER;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "descuentoTransferencia" INTEGER;

