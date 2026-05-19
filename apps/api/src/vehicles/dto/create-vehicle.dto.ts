import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @IsString()
  @IsNotEmpty()
  matricula!: string;

  @IsString()
  @IsNotEmpty()
  marca!: string;

  @IsString()
  @IsNotEmpty()
  modelo!: string;

  @IsInt()
  @Min(1900)
  anio!: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  kilometraje?: number;

  @IsDateString()
  proximoMantenimiento!: string;
}
