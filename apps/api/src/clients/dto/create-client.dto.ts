import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateVehicleInlineDto {
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

  @IsOptional()
  @IsString()
  proximoMantenimiento?: string;
}

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  telefono!: string;

  @IsOptional()
  @IsString()
  telefonoSecundario?: string;

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsEnum(['dni', 'nie', 'cif', 'pasaporte'])
  documentoTipo?: 'dni' | 'nie' | 'cif' | 'pasaporte';

  @IsOptional()
  @IsString()
  documentoNumero?: string;

  @IsOptional()
  @IsString()
  direccionLinea1?: string;

  @IsOptional()
  @IsString()
  direccionLinea2?: string;

  @IsOptional()
  @IsString()
  direccionCiudad?: string;

  @IsOptional()
  @IsString()
  direccionCodigoPostal?: string;

  @IsOptional()
  @IsString()
  direccionProvincia?: string;

  @IsOptional()
  @IsBoolean()
  registrarVehiculo?: boolean;

  @ValidateIf((dto: CreateClientDto) => dto.registrarVehiculo === true)
  @ValidateNested()
  @Type(() => CreateVehicleInlineDto)
  vehiculo?: CreateVehicleInlineDto;
}
