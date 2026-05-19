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
import {
  citaDuracionOpciones,
  citaToFormValues,
  emptyCitaFormValues,
  MOCK_TODAY,
  servicios,
  type Cita,
  type CitaFormValues,
} from '@/lib/mock-data';
import {
  hasCitaFormErrors,
  validateCitaForm,
  type CitaFormErrors,
} from '@/lib/citas/validate-cita-form';
import { cn } from '@/lib/utils';

interface CitaFormProps {
  mode: 'create' | 'edit';
  cita?: Cita;
  defaultClienteId?: string;
  defaultVehiculoId?: string;
  onSubmit: (values: CitaFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
  layout?: 'default' | 'sheet';
  hideFooter?: boolean;
  formId?: string;
}

export function CitaForm({
  mode,
  cita,
  defaultClienteId,
  defaultVehiculoId,
  onSubmit,
  onCancel,
  submitLabel,
  layout = 'default',
  hideFooter = false,
  formId,
}: CitaFormProps) {
  const { clientes, vehiculos } = useClientesStore();
  const isSheet = layout === 'sheet';

  const [values, setValues] = useState<CitaFormValues>(() => {
    if (cita) return citaToFormValues(cita);
    return {
      ...emptyCitaFormValues,
      clienteId: defaultClienteId ?? '',
      vehiculoId: defaultVehiculoId ?? '',
      fecha: MOCK_TODAY,
      hora: '09:00',
    };
  });
  const [errors, setErrors] = useState<CitaFormErrors>({});

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

  function updateField<K extends keyof CitaFormValues>(
    field: K,
    value: CitaFormValues[K]
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
      delete next.form;
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const vehiculoBelongsToCliente = vehiculosCliente.some(
      (v) => v.id === values.vehiculoId
    );
    const nextErrors = validateCitaForm(values, vehiculoBelongsToCliente);
    if (hasCitaFormErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }
    onSubmit(values);
  }

  const fieldClass = (field: keyof CitaFormErrors) =>
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
          <Label htmlFor="servicioId">Servicio</Label>
          <Select
            value={values.servicioId || undefined}
            onValueChange={(v) => updateField('servicioId', v)}
          >
            <SelectTrigger id="servicioId" className={fieldClass('servicioId')}>
              <SelectValue placeholder="Seleccionar servicio" />
            </SelectTrigger>
            <SelectContent>
              {servicios.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.servicioId && (
            <p className="text-xs text-destructive">{errors.servicioId}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="fecha">Fecha</Label>
          <Input
            id="fecha"
            type="date"
            min={MOCK_TODAY}
            value={values.fecha}
            onChange={(e) => updateField('fecha', e.target.value)}
            className={fieldClass('fecha')}
          />
          {errors.fecha && <p className="text-xs text-destructive">{errors.fecha}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hora">Hora</Label>
          <Input
            id="hora"
            type="time"
            value={values.hora}
            onChange={(e) => updateField('hora', e.target.value)}
            className={fieldClass('hora')}
          />
          {errors.hora && <p className="text-xs text-destructive">{errors.hora}</p>}
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="duracionMin">Duración</Label>
          <Select
            value={String(values.duracionMin)}
            onValueChange={(v) => updateField('duracionMin', Number(v))}
          >
            <SelectTrigger id="duracionMin" className={fieldClass('duracionMin')}>
              <SelectValue placeholder="Seleccionar duración" />
            </SelectTrigger>
            <SelectContent>
              {citaDuracionOpciones.map((min) => (
                <SelectItem key={min} value={String(min)}>
                  {min} minutos
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.duracionMin && (
            <p className="text-xs text-destructive">{errors.duracionMin}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="notas">Notas (opcional)</Label>
          <Textarea
            id="notas"
            value={values.notas}
            onChange={(e) => updateField('notas', e.target.value)}
            placeholder="Observaciones o instrucciones para la cita"
            rows={3}
          />
        </div>
      </div>

      {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}

      {!hideFooter && (
        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="min-h-10">
              Cancelar
            </Button>
          )}
          <Button type="submit" className="min-h-10">
            {submitLabel ?? (mode === 'create' ? 'Programar cita' : 'Guardar cambios')}
          </Button>
        </div>
      )}
    </form>
  );
}
