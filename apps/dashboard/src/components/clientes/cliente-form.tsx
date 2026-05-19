'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  clienteToFormValues,
  documentoTipoLabels,
  emptyClienteFormValues,
  type Cliente,
  type ClienteFormValues,
  type DocumentoTipo,
} from '@/lib/mock-data';
import {
  hasFormErrors,
  validateClienteForm,
  type ClienteFormErrors,
} from '@/lib/clientes/validate-cliente-form';
import { cn } from '@/lib/utils';

interface ClienteFormProps {
  mode: 'create' | 'edit';
  cliente?: Cliente;
  onSubmit: (values: ClienteFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
  layout?: 'default' | 'sheet';
  hideFooter?: boolean;
  formId?: string;
}

export function ClienteForm({
  mode,
  cliente,
  onSubmit,
  onCancel,
  submitLabel,
  layout = 'default',
  hideFooter = false,
  formId,
}: ClienteFormProps) {
  const isSheet = layout === 'sheet';
  const [values, setValues] = useState<ClienteFormValues>(() =>
    cliente ? clienteToFormValues(cliente) : { ...emptyClienteFormValues }
  );
  const [errors, setErrors] = useState<ClienteFormErrors>({});

  function updateField<K extends keyof ClienteFormValues>(
    field: K,
    value: ClienteFormValues[K]
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
    const nextErrors = validateClienteForm(values, mode);
    if (hasFormErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }
    onSubmit(values);
  }

  const labelSubmit =
    submitLabel ?? (mode === 'create' ? 'Crear cliente' : 'Guardar cambios');

  const fieldsetClass = cn('flex flex-col', isSheet ? 'gap-5' : 'gap-4');
  const legendClass = cn(
    'text-sm font-semibold text-foreground',
    isSheet && 'mb-1 tracking-tight'
  );
  const twoColClass = cn('grid gap-4', isSheet ? 'grid-cols-1 sm:grid-cols-2' : 'sm:grid-cols-2');
  const cpCiudadClass = cn(
    'grid gap-4',
    isSheet ? 'grid-cols-2' : 'sm:grid-cols-3'
  );

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className={cn('flex flex-col', isSheet ? 'gap-8' : 'gap-6')}
    >
      {errors.form && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.form}
        </p>
      )}

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Identificación</legend>
        <div className="flex flex-col gap-2">
          <Label htmlFor="nombre">Nombre completo *</Label>
          <Input
            id="nombre"
            value={values.nombre}
            onChange={(e) => updateField('nombre', e.target.value)}
            placeholder="Nombre y apellidos"
          />
          {errors.nombre && (
            <p className="text-xs text-destructive">{errors.nombre}</p>
          )}
        </div>
        <div className={twoColClass}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="documentoTipo">Tipo documento</Label>
            <Select
              value={values.documentoTipo || 'none'}
              onValueChange={(v) =>
                updateField('documentoTipo', v === 'none' ? '' : (v as DocumentoTipo))
              }
            >
              <SelectTrigger id="documentoTipo">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin especificar</SelectItem>
                {(Object.keys(documentoTipoLabels) as DocumentoTipo[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {documentoTipoLabels[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="documentoNumero">Número documento</Label>
            <Input
              id="documentoNumero"
              value={values.documentoNumero}
              onChange={(e) => updateField('documentoNumero', e.target.value)}
              placeholder="12345678A"
            />
          </div>
        </div>
      </fieldset>

      <Separator className={isSheet ? 'my-1' : undefined} />

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Contacto</legend>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="cliente@email.com"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className={twoColClass}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="telefono">Teléfono principal</Label>
            <Input
              id="telefono"
              value={values.telefono}
              onChange={(e) => updateField('telefono', e.target.value)}
              placeholder="+34 600 000 000"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="telefonoSecundario">Teléfono secundario</Label>
            <Input
              id="telefonoSecundario"
              value={values.telefonoSecundario}
              onChange={(e) => updateField('telefonoSecundario', e.target.value)}
              placeholder="+34 600 000 001"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="empresa">Empresa (opcional)</Label>
          <Input
            id="empresa"
            value={values.empresa}
            onChange={(e) => updateField('empresa', e.target.value)}
            placeholder="Nombre de la empresa"
          />
        </div>
      </fieldset>

      <Separator className={isSheet ? 'my-1' : undefined} />

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Dirección</legend>
        <div className="flex flex-col gap-2">
          <Label htmlFor="direccionLinea1">Calle y número</Label>
          <Input
            id="direccionLinea1"
            value={values.direccionLinea1}
            onChange={(e) => updateField('direccionLinea1', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="direccionLinea2">Piso, portal, etc.</Label>
          <Input
            id="direccionLinea2"
            value={values.direccionLinea2}
            onChange={(e) => updateField('direccionLinea2', e.target.value)}
          />
        </div>
        <div className={cpCiudadClass}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="codigoPostal">C.P.</Label>
            <Input
              id="codigoPostal"
              value={values.codigoPostal}
              onChange={(e) => updateField('codigoPostal', e.target.value)}
            />
          </div>
          <div className={cn('flex flex-col gap-2', !isSheet && 'sm:col-span-2')}>
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input
              id="ciudad"
              value={values.ciudad}
              onChange={(e) => updateField('ciudad', e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="provincia">Provincia</Label>
          <Input
            id="provincia"
            value={values.provincia}
            onChange={(e) => updateField('provincia', e.target.value)}
          />
        </div>
      </fieldset>

      <Separator className={isSheet ? 'my-1' : undefined} />

      <fieldset className={cn(fieldsetClass, isSheet && 'gap-3')}>
        <legend className={legendClass}>Notas</legend>
        <Textarea
          id="notas"
          value={values.notas}
          onChange={(e) => updateField('notas', e.target.value)}
          rows={3}
          placeholder="Observaciones internas..."
        />
      </fieldset>

      {mode === 'create' && (
        <>
          <Separator />
          <fieldset className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <legend className="text-sm font-semibold">Registrar vehículo</legend>
                <p className="text-xs text-muted-foreground">
                  Opcional: añade el primer vehículo del cliente
                </p>
              </div>
              <Switch
                checked={values.registrarVehiculo}
                onCheckedChange={(checked) => updateField('registrarVehiculo', checked)}
              />
            </div>
            {values.registrarVehiculo && (
              <div className={twoColClass}>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="vehiculoMatricula">Matrícula *</Label>
                  <Input
                    id="vehiculoMatricula"
                    value={values.vehiculoMatricula}
                    onChange={(e) => updateField('vehiculoMatricula', e.target.value)}
                    placeholder="1234 ABC"
                    className="font-mono uppercase"
                  />
                  {errors.vehiculoMatricula && (
                    <p className="text-xs text-destructive">{errors.vehiculoMatricula}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="vehiculoMarca">Marca *</Label>
                  <Input
                    id="vehiculoMarca"
                    value={values.vehiculoMarca}
                    onChange={(e) => updateField('vehiculoMarca', e.target.value)}
                  />
                  {errors.vehiculoMarca && (
                    <p className="text-xs text-destructive">{errors.vehiculoMarca}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="vehiculoModelo">Modelo *</Label>
                  <Input
                    id="vehiculoModelo"
                    value={values.vehiculoModelo}
                    onChange={(e) => updateField('vehiculoModelo', e.target.value)}
                  />
                  {errors.vehiculoModelo && (
                    <p className="text-xs text-destructive">{errors.vehiculoModelo}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="vehiculoAnio">Año</Label>
                  <Input
                    id="vehiculoAnio"
                    type="number"
                    value={values.vehiculoAnio}
                    onChange={(e) => updateField('vehiculoAnio', e.target.value)}
                    placeholder={String(new Date().getFullYear())}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="vehiculoColor">Color</Label>
                  <Input
                    id="vehiculoColor"
                    value={values.vehiculoColor}
                    onChange={(e) => updateField('vehiculoColor', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="vehiculoKilometraje">Kilometraje</Label>
                  <Input
                    id="vehiculoKilometraje"
                    value={values.vehiculoKilometraje}
                    onChange={(e) => updateField('vehiculoKilometraje', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </fieldset>
        </>
      )}

      {!hideFooter && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" className="min-h-11">
            {labelSubmit}
          </Button>
        </div>
      )}
    </form>
  );
}

