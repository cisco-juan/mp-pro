import { IsInt, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  clienteId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  vehiculoId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  servicioId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  hora?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  duracionMin?: number;

  @IsOptional()
  @IsString()
  notas?: string;
}
