-- CreateEnum
CREATE TYPE "InventoryPartEstado" AS ENUM ('activo', 'inactivo');

-- CreateTable
CREATE TABLE "inventory_parts" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 0,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "ubicacion" TEXT,
    "estado" "InventoryPartEstado" NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_parts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_parts_codigo_key" ON "inventory_parts"("codigo");

-- CreateIndex
CREATE INDEX "inventory_parts_categoria_idx" ON "inventory_parts"("categoria");
