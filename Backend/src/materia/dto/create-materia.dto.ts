import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMateriaDto {
  @IsString()
  @IsNotEmpty()
  detalleMateria: string;
}
