import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

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
}
