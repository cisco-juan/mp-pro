import { IsEnum, IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CommercialOrderLineDto {
  @IsEnum(['servicio', 'pieza'])
  tipo!: 'servicio' | 'pieza';

  @IsString()
  @MinLength(1)
  referenciaId!: string;

  @IsString()
  @MinLength(1)
  descripcion!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsNumber()
  @Min(0)
  precioUnitario!: number;
}
