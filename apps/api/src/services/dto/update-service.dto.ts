import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  duracionMin?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  categoria?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
