import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class MateriasDto {
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  materiasIds: number[];
}
