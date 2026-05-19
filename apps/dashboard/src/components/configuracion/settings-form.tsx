'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export function SettingsForm() {
  function handleSave() {
    toast.success('Configuración guardada', {
      description: 'Los cambios son solo visuales en esta fase de maquetación.',
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
              <Input id="nombre-taller" defaultValue="Taller MP Pro" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cif">CIF / NIF</Label>
              <Input id="cif" defaultValue="B12345678" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea id="direccion" defaultValue="Calle Industria 42, 28001 Madrid" rows={2} />
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
                <Input id="apertura" type="time" defaultValue="08:00" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cierre">Cierre</Label>
                <Input id="cierre" type="time" defaultValue="19:00" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bahias">Número de bahías</Label>
              <Input id="bahias" type="number" defaultValue="6" />
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
              { id: 'citas', label: 'Nuevas citas', desc: 'Aviso al crear o modificar citas' },
              { id: 'ordenes', label: 'Órdenes de trabajo', desc: 'Cambios de estado en OTs' },
              { id: 'recordatorios', label: 'Recordatorios', desc: 'Mantenimientos próximos a vencer' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch id={item.id} defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="facturacion">
        <Card>
          <CardHeader>
            <CardTitle>Facturación</CardTitle>
            <CardDescription>Próximamente disponible</CardDescription>
          </CardHeader>
          <CardContent className="flex max-w-lg flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="serie">Serie de factura</Label>
              <Input id="serie" defaultValue="FAC-2026" disabled />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="iva">IVA por defecto (%)</Label>
              <Input id="iva" defaultValue="21" disabled />
            </div>
            <p className="text-sm text-muted-foreground">
              El módulo de facturación estará disponible en una próxima versión.
            </p>
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
