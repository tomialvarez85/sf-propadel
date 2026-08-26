-- CreateEnum
CREATE TYPE "Condicion" AS ENUM ('NUEVO', 'USADO');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "condicion" "Condicion" NOT NULL DEFAULT 'NUEVO',
ADD COLUMN     "estadoConservacion" TEXT;
