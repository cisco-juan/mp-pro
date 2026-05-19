import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateWorkshopSettingsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  nombreTaller?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  cif?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  direccion?: string;

  @IsOptional()
  @IsString()
  horaApertura?: string;

  @IsOptional()
  @IsString()
  horaCierre?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  bahias?: number;

  @IsOptional()
  @IsBoolean()
  notifCitas?: boolean;

  @IsOptional()
  @IsBoolean()
  notifOrdenes?: boolean;

  @IsOptional()
  @IsBoolean()
  notifRecordatorios?: boolean;

  @IsOptional()
  @IsString()
  serieCotizacion?: string;

  @IsOptional()
  @IsString()
  serieFactura?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ivaPorcentaje?: number;
}
