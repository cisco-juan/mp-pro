-- CreateEnum
CREATE TYPE "WorkOrderEstado" AS ENUM ('pendiente', 'en_progreso', 'esperando_piezas', 'completado');

-- CreateEnum
CREATE TYPE "WorkOrderTipo" AS ENUM ('mantenimiento', 'reparacion');

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "WorkOrderTipo" NOT NULL,
    "client_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "assigned_user_id" TEXT NOT NULL,
    "estado" "WorkOrderEstado" NOT NULL DEFAULT 'pendiente',
    "descripcion" TEXT NOT NULL,
    "fecha_entrada" DATE NOT NULL,
    "fecha_estimada" DATE NOT NULL,
    "total_estimado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "orden_comercial_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_parts" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "inventory_part_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "work_order_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_checklist_items" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "item" TEXT NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "work_order_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_timeline_entries" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "WorkOrderEstado" NOT NULL,
    "nota" TEXT NOT NULL,

    CONSTRAINT "work_order_timeline_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_numero_key" ON "work_orders"("numero");

-- CreateIndex
CREATE INDEX "work_orders_client_id_idx" ON "work_orders"("client_id");

-- CreateIndex
CREATE INDEX "work_orders_vehicle_id_idx" ON "work_orders"("vehicle_id");

-- CreateIndex
CREATE INDEX "work_orders_assigned_user_id_idx" ON "work_orders"("assigned_user_id");

-- CreateIndex
CREATE INDEX "work_orders_estado_idx" ON "work_orders"("estado");

-- CreateIndex
CREATE INDEX "work_order_parts_work_order_id_idx" ON "work_order_parts"("work_order_id");

-- CreateIndex
CREATE INDEX "work_order_parts_inventory_part_id_idx" ON "work_order_parts"("inventory_part_id");

-- CreateIndex
CREATE INDEX "work_order_checklist_items_work_order_id_idx" ON "work_order_checklist_items"("work_order_id");

-- CreateIndex
CREATE INDEX "work_order_timeline_entries_work_order_id_idx" ON "work_order_timeline_entries"("work_order_id");

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_parts" ADD CONSTRAINT "work_order_parts_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_parts" ADD CONSTRAINT "work_order_parts_inventory_part_id_fkey" FOREIGN KEY ("inventory_part_id") REFERENCES "inventory_parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_checklist_items" ADD CONSTRAINT "work_order_checklist_items_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_timeline_entries" ADD CONSTRAINT "work_order_timeline_entries_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
