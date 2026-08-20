-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "nombreCliente" TEXT NOT NULL,
    "comentario" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);
