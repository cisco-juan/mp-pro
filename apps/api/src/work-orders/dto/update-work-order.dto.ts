import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clienteId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  vehiculoId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  usuarioId?: string;

  @IsOptional()
  @IsEnum(['mantenimiento', 'reparacion'])
  tipo?: 'mantenimiento' | 'reparacion';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaEntrada?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaEstimada?: string;
}
