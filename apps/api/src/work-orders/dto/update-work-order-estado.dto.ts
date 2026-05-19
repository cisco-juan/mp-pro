import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateWorkOrderEstadoDto {
  @IsEnum(['pendiente', 'en_progreso', 'esperando_piezas', 'completado'])
  estado!: 'pendiente' | 'en_progreso' | 'esperando_piezas' | 'completado';

  @IsOptional()
  @IsString()
  nota?: string;
}
