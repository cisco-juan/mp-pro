import { IsEnum, IsNumber, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @MinLength(1)
  ordenComercialId!: string;

  @IsNumber()
  @Min(0.01)
  monto!: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha?: string;

  @IsEnum(['efectivo', 'tarjeta', 'transferencia'])
  metodo!: 'efectivo' | 'tarjeta' | 'transferencia';

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
