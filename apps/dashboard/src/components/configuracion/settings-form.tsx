'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useConfiguracionStore } from '@/lib/configuracion/configuracion-store';

export function SettingsForm() {
  const { configuracion, updateConfiguracion } = useConfiguracionStore();

  function handleSave() {
    toast.success('Configuración guardada', {
      description: 'Los ajustes se aplicarán en esta sesión del dashboard.',
    });
  }

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="taller">Taller</TabsTrigger>
        <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
        <TabsTrigger value="facturacion">Facturación</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Datos generales</CardTitle>
            <CardDescription>Información básica del negocio</CardDescription>
          </CardHeader>
          <CardContent className="flex max-w-lg flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre-taller">Nombre del taller</Label>
              <Input
                id="nombre-taller"
                value={configuracion.nombreTaller}
                onChange={(e) => updateConfiguracion({ nombreTaller: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cif">CIF / NIF</Label>
              <Input
                id="cif"
                value={configuracion.cif}
                onChange={(e) => updateConfiguracion({ cif: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                rows={2}
                value={configuracion.direccion}
                onChange={(e) => updateConfiguracion({ direccion: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="taller">
        <Card>
          <CardHeader>
            <CardTitle>Horario del taller</CardTitle>
            <CardDescription>Configura el horario de atención</CardDescription>
          </CardHeader>
          <CardContent className="flex max-w-lg flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="apertura">Apertura</Label>
                <Input
                  id="apertura"
                  type="time"
                  value={configuracion.horaApertura}
                  onChange={(e) => updateConfiguracion({ horaApertura: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cierre">Cierre</Label>
                <Input
                  id="cierre"
                  type="time"
                  value={configuracion.horaCierre}
                  onChange={(e) => updateConfiguracion({ horaCierre: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bahias">Número de bahías</Label>
              <Input
                id="bahias"
                type="number"
                min={1}
                value={configuracion.bahias}
                onChange={(e) =>
                  updateConfiguracion({ bahias: parseInt(e.target.value, 10) || 1 })
                }
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notificaciones">
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>Preferencias de avisos del sistema</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {[
              {
                id: 'citas',
                key: 'notifCitas' as const,
                label: 'Nuevas citas',
                desc: 'Aviso al crear o modificar citas',
              },
              {
                id: 'ordenes',
                key: 'notifOrdenes' as const,
                label: 'Órdenes de trabajo',
                desc: 'Cambios de estado en OTs',
              },
              {
                id: 'recordatorios',
                key: 'notifRecordatorios' as const,
                label: 'Recordatorios',
                desc: 'Mantenimientos próximos a vencer',
              },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={configuracion[item.key]}
                  onCheckedChange={(checked) => updateConfiguracion({ [item.key]: checked })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="facturacion">
        <Card>
          <CardHeader>
            <CardTitle>Facturación</CardTitle>
            <CardDescription>Series, IVA y preferencias de órdenes comerciales</CardDescription>
          </CardHeader>
          <CardContent className="flex max-w-lg flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="serie-cot">Serie de cotización</Label>
              <Input
                id="serie-cot"
                value={configuracion.serieCotizacion}
                onChange={(e) => updateConfiguracion({ serieCotizacion: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="serie">Serie de factura</Label>
              <Input
                id="serie"
                value={configuracion.serieFactura}
                onChange={(e) => updateConfiguracion({ serieFactura: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="iva">IVA por defecto (%)</Label>
              <Input
                id="iva"
                type="number"
                min={0}
                max={100}
                value={configuracion.ivaPorcentaje}
                onChange={(e) =>
                  updateConfiguracion({ ivaPorcentaje: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <Button variant="outline" asChild className="w-fit">
              <Link href="/ordenes">Ir al módulo de órdenes</Link>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} className="min-h-11">
          Guardar cambios
        </Button>
      </div>
    </Tabs>
  );
}
