import { IsEnum } from 'class-validator';

export class UpdateAppointmentEstadoDto {
  @IsEnum(['pendiente', 'confirmada', 'completada', 'cancelada'])
  estado!: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
}
