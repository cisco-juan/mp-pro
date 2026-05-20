'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import { useOrdenesComercialesStore } from '@/lib/ordenes/ordenes-comerciales-store';
import type { LineaOrdenTipo } from '@/lib/mock-data';

interface LineaForm {
  tipo: LineaOrdenTipo;
  descripcion: string;
  cantidad: string;
  precioUnitario: string;
}

const emptyLinea: LineaForm = {
  tipo: 'servicio',
  descripcion: '',
  cantidad: '1',
  precioUnitario: '',
};

interface NuevaCotizacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NuevaCotizacionDialog({ open, onOpenChange }: NuevaCotizacionDialogProps) {
  const { clientes, vehiculos } = useClientesStore();
  const { createCotizacion } = useOrdenesComercialesStore();

  const [clienteId, setClienteId] = useState('');
  const [vehiculoId, setVehiculoId] = useState('');
  const [lineas, setLineas] = useState<LineaForm[]>([{ ...emptyLinea }]);

  const clientesActivos = useMemo(
    () => clientes.filter((c) => c.estado === 'activo'),
    [clientes],
  );

  const vehiculosCliente = useMemo(
    () => vehiculos.filter((v) => v.clienteId === clienteId),
    [vehiculos, clienteId],
  );

  const total = useMemo(() => {
    return lineas.reduce((sum, l) => {
      const cant = parseFloat(l.cantidad) || 0;
      const precio = parseFloat(l.precioUnitario) || 0;
      return sum + cant * precio;
    }, 0);
  }, [lineas]);

  function addLinea() {
    setLineas((prev) => [...prev, { ...emptyLinea }]);
  }

  function removeLinea(index: number) {
    setLineas((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLinea(index: number, field: keyof LineaForm, value: string) {
    setLineas((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)),
    );
  }

  function resetForm() {
    setClienteId('');
    setVehiculoId('');
    setLineas([{ ...emptyLinea }]);
  }

  async function handleSubmit() {
    if (!clienteId) {
      toast.error('Selecciona un cliente');
      return;
    }
    if (lineas.length === 0 || lineas.every((l) => !l.descripcion.trim())) {
      toast.error('Agrega al menos una línea');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const validez = new Date();
    validez.setDate(validez.getDate() + 30);

    const cotizacion = await createCotizacion({
      clienteId,
      vehiculoId: vehiculoId || undefined,
      fecha: today,
      validezHasta: validez.toISOString().slice(0, 10),
      lineas: lineas
        .filter((l) => l.descripcion.trim())
        .map((l) => ({
          tipo: l.tipo,
          referenciaId: l.tipo === 'servicio' ? 'manual' : 'manual',
          descripcion: l.descripcion,
          cantidad: parseInt(l.cantidad, 10) || 1,
          precioUnitario: parseFloat(l.precioUnitario) || 0,
        })),
    });

    if (!cotizacion) {
      toast.error('No se pudo crear la cotización');
      return;
    }

    toast.success('Cotización creada', { description: cotizacion.numero });
    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva cotización</DialogTitle>
          <DialogDescription>Crear una cotización manual para un cliente.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Cliente</Label>
              <Select
                value={clienteId}
                onValueChange={(v) => {
                  setClienteId(v);
                  setVehiculoId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientesActivos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Vehículo</Label>
              <Select
                value={vehiculoId}
                onValueChange={setVehiculoId}
                disabled={!clienteId || vehiculosCliente.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={clienteId ? 'Seleccionar vehículo' : 'Selecciona un cliente'} />
                </SelectTrigger>
                <SelectContent>
                  {vehiculosCliente.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.matricula} — {v.marca} {v.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Líneas</Label>
              <Button variant="outline" size="sm" onClick={addLinea}>
                <Plus className="mr-1 size-3" />
                Agregar línea
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {lineas.map((linea, idx) => (
                <div key={idx} className="flex items-end gap-2 rounded-md border p-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Tipo</Label>
                    <Select
                      value={linea.tipo}
                      onValueChange={(v) => updateLinea(idx, 'tipo', v)}
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="servicio">Servicio</SelectItem>
                        <SelectItem value="pieza">Pieza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Label className="text-xs">Descripción</Label>
                    <Input
                      placeholder="Descripción"
                      value={linea.descripcion}
                      onChange={(e) => updateLinea(idx, 'descripcion', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Cantidad</Label>
                    <Input
                      type="number"
                      min={1}
                      className="w-[70px]"
                      value={linea.cantidad}
                      onChange={(e) => updateLinea(idx, 'cantidad', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Precio (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-[100px]"
                      value={linea.precioUnitario}
                      onChange={(e) => updateLinea(idx, 'precioUnitario', e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 text-destructive"
                    onClick={() => removeLinea(idx)}
                    disabled={lineas.length <= 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end border-t pt-3">
            <p className="text-lg font-semibold">
              Total: {total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Crear cotización</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
