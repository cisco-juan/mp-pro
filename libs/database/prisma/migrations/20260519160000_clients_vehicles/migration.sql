-- CreateEnum
CREATE TYPE "ClienteEstado" AS ENUM ('activo', 'inactivo');

-- CreateEnum
CREATE TYPE "DocumentoTipo" AS ENUM ('dni', 'nie', 'cif', 'pasaporte');

-- CreateEnum
CREATE TYPE "VehiculoEstado" AS ENUM ('activo', 'inactivo');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "telefono_secundario" TEXT,
    "empresa" TEXT,
    "notas" TEXT,
    "estado" "ClienteEstado" NOT NULL DEFAULT 'activo',
    "ultima_visita" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documento_tipo" "DocumentoTipo",
    "documento_numero" TEXT,
    "direccion_linea1" TEXT,
    "direccion_linea2" TEXT,
    "direccion_ciudad" TEXT,
    "direccion_codigo_postal" TEXT,
    "direccion_provincia" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '—',
    "kilometraje" INTEGER NOT NULL DEFAULT 0,
    "proximo_mantenimiento" DATE NOT NULL,
    "estado" "VehiculoEstado" NOT NULL DEFAULT 'activo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_matricula_key" ON "vehicles"("matricula");

-- CreateIndex
CREATE INDEX "vehicles_client_id_idx" ON "vehicles"("client_id");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
