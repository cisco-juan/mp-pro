import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  matricula?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  anio?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  kilometraje?: number;

  @IsOptional()
  @IsDateString()
  proximoMantenimiento?: string;
}
