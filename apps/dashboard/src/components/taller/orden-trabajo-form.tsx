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
import { Textarea } from '@/components/ui/textarea';
import { useClientesStore } from '@/lib/clientes/clientes-store';
import { useUsuariosStore } from '@/lib/usuarios/usuarios-store';
import {
  emptyOrdenTrabajoFormValues,
  ordenTrabajoToFormValues,
  ordenTrabajoTipoLabels,
  MOCK_TODAY,
  type OrdenTrabajo,
  type OrdenTrabajoFormValues,
  type OrdenTrabajoTipo,
} from '@/lib/mock-data';
import {
  hasOrdenTrabajoFormErrors,
  validateOrdenTrabajoForm,
  type OrdenTrabajoFormErrors,
} from '@/lib/taller/validate-orden-trabajo-form';
import { cn } from '@/lib/utils';

interface OrdenTrabajoFormProps {
  mode: 'create' | 'edit';
  orden?: OrdenTrabajo;
  defaultClienteId?: string;
  defaultVehiculoId?: string;
  onSubmit: (values: OrdenTrabajoFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
  layout?: 'default' | 'sheet';
  hideFooter?: boolean;
  formId?: string;
}

export function OrdenTrabajoForm({
  mode,
  orden,
  defaultClienteId,
  defaultVehiculoId,
  onSubmit,
  onCancel,
  submitLabel,
  layout = 'default',
  hideFooter = false,
  formId,
}: OrdenTrabajoFormProps) {
  const { clientes, vehiculos } = useClientesStore();
  const { getUsuariosMecanicos } = useUsuariosStore();
  const isSheet = layout === 'sheet';
  const mecanicos = useMemo(() => getUsuariosMecanicos(), [getUsuariosMecanicos]);

  const [values, setValues] = useState<OrdenTrabajoFormValues>(() => {
    if (orden) return ordenTrabajoToFormValues(orden);
    return {
      ...emptyOrdenTrabajoFormValues,
      clienteId: defaultClienteId ?? '',
      vehiculoId: defaultVehiculoId ?? '',
      fechaEntrada: MOCK_TODAY,
      fechaEstimada: MOCK_TODAY,
    };
  });
  const [errors, setErrors] = useState<OrdenTrabajoFormErrors>({});

  const clientesActivos = useMemo(
    () => clientes.filter((c) => c.estado === 'activo'),
    [clientes]
  );

  const vehiculosCliente = useMemo(
    () =>
      values.clienteId
        ? vehiculos.filter(
            (v) => v.clienteId === values.clienteId && v.estado === 'activo'
          )
        : [],
    [vehiculos, values.clienteId]
  );

  function updateField<K extends keyof OrdenTrabajoFormValues>(
    field: K,
    value: OrdenTrabajoFormValues[K]
  ) {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'clienteId') {
        next.vehiculoId = '';
      }
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const vehiculoBelongsToCliente = vehiculosCliente.some(
      (v) => v.id === values.vehiculoId
    );
    const nextErrors = validateOrdenTrabajoForm(values, vehiculoBelongsToCliente);
    if (hasOrdenTrabajoFormErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }
    onSubmit(values);
  }

  const fieldClass = (field: keyof OrdenTrabajoFormErrors) =>
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

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="vehiculoId">Vehículo</Label>
          <Select
            value={values.vehiculoId || undefined}
            onValueChange={(v) => updateField('vehiculoId', v)}
            disabled={!values.clienteId || (Boolean(defaultVehiculoId) && mode === 'create')}
          >
            <SelectTrigger id="vehiculoId" className={fieldClass('vehiculoId')}>
              <SelectValue
                placeholder={
                  values.clienteId
                    ? 'Seleccionar vehículo'
                    : 'Primero selecciona un cliente'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {vehiculosCliente.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.marca} {v.modelo} ({v.matricula})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vehiculoId && (
            <p className="text-xs text-destructive">{errors.vehiculoId}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="usuarioId">Mecánico asignado</Label>
          <Select
            value={values.usuarioId || undefined}
            onValueChange={(v) => updateField('usuarioId', v)}
          >
            <SelectTrigger id="usuarioId" className={fieldClass('usuarioId')}>
              <SelectValue placeholder="Seleccionar mecánico" />
            </SelectTrigger>
            <SelectContent>
              {mecanicos.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.usuarioId && (
            <p className="text-xs text-destructive">{errors.usuarioId}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="tipo">Tipo de trabajo</Label>
          <Select
            value={values.tipo}
            onValueChange={(v) => updateField('tipo', v as OrdenTrabajoTipo)}
          >
            <SelectTrigger id="tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ordenTrabajoTipoLabels) as OrdenTrabajoTipo[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {ordenTrabajoTipoLabels[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="fechaEntrada">Fecha de entrada</Label>
          <Input
            id="fechaEntrada"
            type="date"
            value={values.fechaEntrada}
            onChange={(e) => updateField('fechaEntrada', e.target.value)}
            className={fieldClass('fechaEntrada')}
          />
          {errors.fechaEntrada && (
            <p className="text-xs text-destructive">{errors.fechaEntrada}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="fechaEstimada">Fecha estimada de entrega</Label>
          <Input
            id="fechaEstimada"
            type="date"
            min={values.fechaEntrada || undefined}
            value={values.fechaEstimada}
            onChange={(e) => updateField('fechaEstimada', e.target.value)}
            className={fieldClass('fechaEstimada')}
          />
          {errors.fechaEstimada && (
            <p className="text-xs text-destructive">{errors.fechaEstimada}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="descripcion">Descripción del trabajo</Label>
          <Textarea
            id="descripcion"
            value={values.descripcion}
            onChange={(e) => updateField('descripcion', e.target.value)}
            placeholder="Describe el trabajo a realizar"
            rows={3}
            className={fieldClass('descripcion')}
          />
          {errors.descripcion && (
            <p className="text-xs text-destructive">{errors.descripcion}</p>
          )}
        </div>
      </div>

      {!hideFooter && (
        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="min-h-10">
              Cancelar
            </Button>
          )}
          <Button type="submit" className="min-h-10">
            {submitLabel ?? (mode === 'create' ? 'Crear orden' : 'Guardar cambios')}
          </Button>
        </div>
      )}
    </form>
  );
}
