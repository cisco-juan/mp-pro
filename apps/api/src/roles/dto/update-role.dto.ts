import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permisos?: string[];
}
