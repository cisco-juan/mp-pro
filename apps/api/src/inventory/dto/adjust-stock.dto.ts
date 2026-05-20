import { IsInt, IsOptional, IsString } from 'class-validator';

export class AdjustStockDto {
  @IsInt()
  delta!: number;

  @IsOptional()
  @IsString()
  nota?: string;
}
