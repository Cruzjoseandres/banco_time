import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateConversacionDto {
  @IsNumber()
  @IsNotEmpty()
  tutorId: number;

  @IsNumber()
  @IsNotEmpty()
  materiaId: number;
}
