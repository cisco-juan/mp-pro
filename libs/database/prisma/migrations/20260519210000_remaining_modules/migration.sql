-- CreateEnum
CREATE TYPE "AppointmentEstado" AS ENUM ('pendiente', 'confirmada', 'completada', 'cancelada');

-- CreateEnum
CREATE TYPE "CommercialOrderTipo" AS ENUM ('cotizacion', 'factura');

-- CreateEnum
CREATE TYPE "CommercialOrderEstado" AS ENUM ('borrador', 'enviada', 'aceptada', 'rechazada', 'convertida', 'emitida', 'pagada', 'vencida', 'anulada');

-- CreateEnum
CREATE TYPE "CommercialOrderLineTipo" AS ENUM ('servicio', 'pieza');

-- CreateEnum
CREATE TYPE "PaymentMetodo" AS ENUM ('efectivo', 'tarjeta', 'transferencia');

-- CreateTable
CREATE TABLE "service_catalog" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "precio" DECIMAL(10,2) NOT NULL,
    "duracion_min" INTEGER NOT NULL DEFAULT 60,
    "categoria" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TEXT NOT NULL,
    "duracion_min" INTEGER NOT NULL,
    "estado" "AppointmentEstado" NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commercial_orders" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "CommercialOrderTipo" NOT NULL,
    "estado" "CommercialOrderEstado" NOT NULL,
    "client_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "fecha" DATE NOT NULL,
    "validez_hasta" DATE,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "iva" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commercial_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commercial_order_lines" (
    "id" TEXT NOT NULL,
    "commercial_order_id" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "tipo" "CommercialOrderLineTipo" NOT NULL,
    "referencia_id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "commercial_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "commercial_order_id" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha" DATE NOT NULL,
    "metodo" "PaymentMetodo" NOT NULL,
    "referencia" TEXT,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshop_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "nombre_taller" TEXT NOT NULL,
    "cif" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "hora_apertura" TEXT NOT NULL,
    "hora_cierre" TEXT NOT NULL,
    "bahias" INTEGER NOT NULL DEFAULT 6,
    "notif_citas" BOOLEAN NOT NULL DEFAULT true,
    "notif_ordenes" BOOLEAN NOT NULL DEFAULT true,
    "notif_recordatorios" BOOLEAN NOT NULL DEFAULT true,
    "serie_cotizacion" TEXT NOT NULL,
    "serie_factura" TEXT NOT NULL,
    "iva_porcentaje" DECIMAL(5,2) NOT NULL DEFAULT 21,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshop_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_catalog_categoria_idx" ON "service_catalog"("categoria");

-- CreateIndex
CREATE INDEX "appointments_client_id_idx" ON "appointments"("client_id");

-- CreateIndex
CREATE INDEX "appointments_vehicle_id_idx" ON "appointments"("vehicle_id");

-- CreateIndex
CREATE INDEX "appointments_service_id_idx" ON "appointments"("service_id");

-- CreateIndex
CREATE INDEX "appointments_fecha_idx" ON "appointments"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "commercial_orders_numero_key" ON "commercial_orders"("numero");

-- CreateIndex
CREATE INDEX "commercial_orders_client_id_idx" ON "commercial_orders"("client_id");

-- CreateIndex
CREATE INDEX "commercial_orders_vehicle_id_idx" ON "commercial_orders"("vehicle_id");

-- CreateIndex
CREATE INDEX "commercial_orders_tipo_idx" ON "commercial_orders"("tipo");

-- CreateIndex
CREATE INDEX "commercial_orders_estado_idx" ON "commercial_orders"("estado");

-- CreateIndex
CREATE INDEX "commercial_order_lines_commercial_order_id_idx" ON "commercial_order_lines"("commercial_order_id");

-- CreateIndex
CREATE INDEX "payments_commercial_order_id_idx" ON "payments"("commercial_order_id");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_orders" ADD CONSTRAINT "commercial_orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_orders" ADD CONSTRAINT "commercial_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_order_lines" ADD CONSTRAINT "commercial_order_lines_commercial_order_id_fkey" FOREIGN KEY ("commercial_order_id") REFERENCES "commercial_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_commercial_order_id_fkey" FOREIGN KEY ("commercial_order_id") REFERENCES "commercial_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Clear orphan commercial order references before FK (re-linked by seed)
UPDATE "work_orders" SET "orden_comercial_id" = NULL WHERE "orden_comercial_id" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_orden_comercial_id_fkey" FOREIGN KEY ("orden_comercial_id") REFERENCES "commercial_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
