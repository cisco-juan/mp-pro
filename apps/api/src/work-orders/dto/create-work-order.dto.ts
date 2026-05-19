import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  clienteId!: string;

  @IsString()
  @IsNotEmpty()
  vehiculoId!: string;

  @IsString()
  @IsNotEmpty()
  usuarioId!: string;

  @IsEnum(['mantenimiento', 'reparacion'])
  tipo!: 'mantenimiento' | 'reparacion';

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaEntrada!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaEstimada!: string;
}
