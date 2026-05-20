import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ReserveStockDto {
  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsOptional()
  @IsString()
  nota?: string;
}
