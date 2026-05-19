import { IsNotEmpty, IsString } from 'class-validator';

export class LinkCommercialOrderDto {
  @IsString()
  @IsNotEmpty()
  ordenComercialId!: string;
}
