import { IsEnum } from 'class-validator';

export class UpdateCommercialOrderEstadoDto {
  @IsEnum([
    'borrador',
    'enviada',
    'aceptada',
    'rechazada',
    'convertida',
    'emitida',
    'pagada',
    'vencida',
    'anulada',
  ])
  estado!:
    | 'borrador'
    | 'enviada'
    | 'aceptada'
    | 'rechazada'
    | 'convertida'
    | 'emitida'
    | 'pagada'
    | 'vencida'
    | 'anulada';
}
