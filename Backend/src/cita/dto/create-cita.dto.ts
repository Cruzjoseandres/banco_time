import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCitaDto {
  @IsDateString()
  @IsNotEmpty()
  fechaHoraInicio: string;

  @IsDateString()
  @IsNotEmpty()
  fechaHoraFin: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  latitud: string;

  @IsString()
  @IsNotEmpty()
  longitud: string;

  @IsNumber()
  @IsNotEmpty()
  tutorId: number;

  @IsNumber()
  @IsOptional()
  materiaId?: number;
}
