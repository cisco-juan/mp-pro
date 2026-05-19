import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CommercialOrderLineDto } from './commercial-order-line.dto';

export class CreateCommercialOrderDto {
  @IsEnum(['cotizacion', 'factura'])
  tipo!: 'cotizacion' | 'factura';

  @IsString()
  @MinLength(1)
  clienteId!: string;

  @IsOptional()
  @IsString()
  vehiculoId?: string;

  @IsOptional()
  @IsString()
  ordenTrabajoId?: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  validezHasta?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommercialOrderLineDto)
  lineas!: CommercialOrderLineDto[];
}
