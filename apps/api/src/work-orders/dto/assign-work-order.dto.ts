import { IsNotEmpty, IsString } from 'class-validator';

export class AssignWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  usuarioId!: string;
}
