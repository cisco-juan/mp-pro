import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddWorkOrderPartDto {
  @IsString()
  @IsNotEmpty()
  piezaId!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsNumber()
  @Min(0)
  precioUnitario!: number;
}
