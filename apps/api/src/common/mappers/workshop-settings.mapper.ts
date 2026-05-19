import type { WorkshopSettings } from '@org/database';

export type ConfiguracionTallerResponse = {
  nombreTaller: string;
  cif: string;
  direccion: string;
  horaApertura: string;
  horaCierre: string;
  bahias: number;
  notifCitas: boolean;
  notifOrdenes: boolean;
  notifRecordatorios: boolean;
  serieCotizacion: string;
  serieFactura: string;
  ivaPorcentaje: number;
};

export function mapWorkshopSettingsToResponse(
  settings: WorkshopSettings,
): ConfiguracionTallerResponse {
  return {
    nombreTaller: settings.nombreTaller,
    cif: settings.cif,
    direccion: settings.direccion,
    horaApertura: settings.horaApertura,
    horaCierre: settings.horaCierre,
    bahias: settings.bahias,
    notifCitas: settings.notifCitas,
    notifOrdenes: settings.notifOrdenes,
    notifRecordatorios: settings.notifRecordatorios,
    serieCotizacion: settings.serieCotizacion,
    serieFactura: settings.serieFactura,
    ivaPorcentaje: Number(settings.ivaPorcentaje),
  };
}
