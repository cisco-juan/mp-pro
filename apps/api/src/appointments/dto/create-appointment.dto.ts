import { IsInt, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @MinLength(1)
  clienteId!: string;

  @IsString()
  @MinLength(1)
  vehiculoId!: string;

  @IsString()
  @MinLength(1)
  servicioId!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  hora!: string;

  @IsInt()
  @Min(15)
  duracionMin!: number;

  @IsOptional()
  @IsString()
  notas?: string;
}
