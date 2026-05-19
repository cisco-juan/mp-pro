import type { Payment } from '@org/database';

export type PagoResponse = {
  id: string;
  ordenComercialId: string;
  monto: number;
  fecha: string;
  metodo: 'efectivo' | 'tarjeta' | 'transferencia';
  referencia?: string;
  notas?: string;
};

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function mapPaymentToResponse(payment: Payment): PagoResponse {
  return {
    id: payment.id,
    ordenComercialId: payment.commercialOrderId,
    monto: Number(payment.monto),
    fecha: formatDateOnly(payment.fecha),
    metodo: payment.metodo,
    referencia: payment.referencia ?? undefined,
    notas: payment.notas ?? undefined,
  };
}
