'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  emptyVehiculoFormValues,
  vehiculoToFormValues,
  type Vehiculo,
  type VehiculoFormValues,
} from '@/lib/mock-data';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import {
  hasVehiculoFormErrors,
  validateVehiculoForm,
  type VehiculoFormErrors,
} from '@/lib/vehiculos/validate-vehiculo-form';
import { cn } from '@/lib/utils';

function defaultProximoMantenimiento(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().slice(0, 10);
}

interface VehiculoFormProps {
  mode: 'create' | 'edit';
  vehiculo?: Vehiculo;
  defaultClienteId?: string;
  onSubmit: (values: VehiculoFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
  layout?: 'default' | 'sheet';
  hideFooter?: boolean;
  formId?: string;
}

export function VehiculoForm({
  mode,
  vehiculo,
  defaultClienteId,
  onSubmit,
  onCancel,
  submitLabel,
  layout = 'default',
  hideFooter = false,
  formId,
}: VehiculoFormProps) {
  const { clientes, vehiculos } = useClientesStore();
  const isSheet = layout === 'sheet';

  const [values, setValues] = useState<VehiculoFormValues>(() => {
    if (vehiculo) return vehiculoToFormValues(vehiculo);
    return {
      ...emptyVehiculoFormValues,
      clienteId: defaultClienteId ?? '',
      proximoMantenimiento: defaultProximoMantenimiento(),
    };
  });
  const [errors, setErrors] = useState<VehiculoFormErrors>({});

  const clientesActivos = useMemo(
    () => clientes.filter((c) => c.estado === 'activo'),
    [clientes]
  );

  const existingMatriculas = useMemo(
    () => vehiculos.map((v) => v.matricula),
    [vehiculos]
  );

  function updateField<K extends keyof VehiculoFormValues>(
    field: K,
    value: VehiculoFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next.form;
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validateVehiculoForm(
      values,
      existingMatriculas,
      mode === 'edit' ? vehiculo?.matricula : undefined
    );
    if (hasVehiculoFormErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }
    onSubmit(values);
  }

  const fieldClass = (field: keyof VehiculoFormErrors) =>
    cn(errors[field] && 'border-destructive');

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className={cn('flex flex-col gap-4', isSheet && 'gap-5')}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="clienteId">Cliente</Label>
          <Select
            value={values.clienteId || undefined}
            onValueChange={(v) => updateField('clienteId', v)}
            disabled={Boolean(defaultClienteId) && mode === 'create'}
          >
            <SelectTrigger id="clienteId" className={fieldClass('clienteId')}>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientesActivos.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nombre}
                  {c.empresa ? ` · ${c.empresa}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.clienteId && (
            <p className="text-xs text-destructive">{errors.clienteId}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="matricula">Matrícula</Label>
          <Input
            id="matricula"
            value={values.matricula}
            onChange={(e) => updateField('matricula', e.target.value.toUpperCase())}
            className={fieldClass('matricula')}
            placeholder="1234 ABC"
          />
          {errors.matricula && (
            <p className="text-xs text-destructive">{errors.matricula}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="marca">Marca</Label>
          <Input
            id="marca"
            value={values.marca}
            onChange={(e) => updateField('marca', e.target.value)}
            className={fieldClass('marca')}
          />
          {errors.marca && <p className="text-xs text-destructive">{errors.marca}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="modelo">Modelo</Label>
          <Input
            id="modelo"
            value={values.modelo}
            onChange={(e) => updateField('modelo', e.target.value)}
            className={fieldClass('modelo')}
          />
          {errors.modelo && <p className="text-xs text-destructive">{errors.modelo}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="anio">Año</Label>
          <Input
            id="anio"
            type="number"
            min={1980}
            max={new Date().getFullYear() + 1}
            value={values.anio}
            onChange={(e) => updateField('anio', e.target.value)}
            className={fieldClass('anio')}
          />
          {errors.anio && <p className="text-xs text-destructive">{errors.anio}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={values.color}
            onChange={(e) => updateField('color', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="kilometraje">Kilometraje</Label>
          <Input
            id="kilometraje"
            value={values.kilometraje}
            onChange={(e) => updateField('kilometraje', e.target.value)}
            placeholder="85000"
            className={fieldClass('kilometraje')}
          />
          {errors.kilometraje && (
            <p className="text-xs text-destructive">{errors.kilometraje}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="proximoMantenimiento">Próximo mantenimiento</Label>
          <Input
            id="proximoMantenimiento"
            type="date"
            value={values.proximoMantenimiento}
            onChange={(e) => updateField('proximoMantenimiento', e.target.value)}
            className={fieldClass('proximoMantenimiento')}
          />
          {errors.proximoMantenimiento && (
            <p className="text-xs text-destructive">{errors.proximoMantenimiento}</p>
          )}
        </div>
      </div>

      {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}

      {!hideFooter && (
        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">
            {submitLabel ?? (mode === 'create' ? 'Registrar vehículo' : 'Guardar cambios')}
          </Button>
        </div>
      )}
    </form>
  );
}
