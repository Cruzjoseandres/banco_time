import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMensajeDto {
  @IsNumber()
  @IsNotEmpty()
  conversacionId: number;

  @IsString()
  @IsNotEmpty()
  detalleMensaje: string;
}
