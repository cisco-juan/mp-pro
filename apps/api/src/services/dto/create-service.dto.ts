import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MinLength(1)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  precio!: number;

  @IsInt()
  @Min(1)
  duracionMin!: number;

  @IsString()
  @MinLength(1)
  categoria!: string;
}
