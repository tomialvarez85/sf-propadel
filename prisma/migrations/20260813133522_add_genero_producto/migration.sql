-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('HOMBRE', 'MUJER', 'UNISEX');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "genero" "Genero";
