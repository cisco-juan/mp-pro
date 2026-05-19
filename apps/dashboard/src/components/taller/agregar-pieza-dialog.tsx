'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PiezaUsada } from '@/lib/mock-data';
import { useInventarioStore } from '@/lib/inventario/inventario-store';

interface AgregarPiezaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (pieza: PiezaUsada) => void;
  piezasExistentes: PiezaUsada[];
}

export function AgregarPiezaDialog({
  open,
  onOpenChange,
  onAdd,
  piezasExistentes,
}: AgregarPiezaDialogProps) {
  const { piezas, getPieza, reservarStock } = useInventarioStore();
  const [piezaId, setPiezaId] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [error, setError] = useState('');

  const piezasDisponibles = piezas.filter(
    (p) => !piezasExistentes.some((pu) => pu.piezaId === p.id)
  );

  const piezaSeleccionada = piezaId ? getPieza(piezaId) : undefined;

  function handleClose() {
    setPiezaId('');
    setCantidad('1');
    setError('');
    onOpenChange(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!piezaId) {
      setError('Selecciona una pieza');
      return;
    }
    const qty = parseInt(cantidad, 10);
    if (!qty || qty < 1) {
      setError('Indica una cantidad válida');
      return;
    }
    const pieza = getPieza(piezaId);
    if (!pieza) return;
    if (pieza.stock < qty) {
      setError(`Stock insuficiente (disponible: ${pieza.stock})`);
      return;
    }

    onAdd({
      piezaId: pieza.id,
      cantidad: qty,
      precioUnitario: pieza.precioUnitario,
    });
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Añadir pieza</DialogTitle>
            <DialogDescription>
              Selecciona una pieza del inventario para esta orden de trabajo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="piezaId">Pieza</Label>
              <Select value={piezaId || undefined} onValueChange={setPiezaId}>
                <SelectTrigger id="piezaId">
                  <SelectValue placeholder="Seleccionar pieza" />
                </SelectTrigger>
                <SelectContent>
                  {piezasDisponibles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre} ({p.codigo}) — {p.precioUnitario.toLocaleString('es-ES')} €
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                min={1}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
              {piezaSeleccionada && (
                <p className="text-xs text-muted-foreground">
                  Stock disponible: {piezaSeleccionada.stock} uds.
                </p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={piezasDisponibles.length === 0}>
              Añadir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
