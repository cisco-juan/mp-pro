import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

class WorkOrderPartItemDto {
  @IsString()
  piezaId!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsNumber()
  @Min(0)
  precioUnitario!: number;
}

export class SetWorkOrderPartsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkOrderPartItemDto)
  piezas!: WorkOrderPartItemDto[];
}
