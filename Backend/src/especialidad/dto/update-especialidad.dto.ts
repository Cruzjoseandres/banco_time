import { IsNotEmpty, IsString } from "class-validator";

export class UpdateEspecialidadDto {
    @IsString()
    @IsNotEmpty()
    detalleEspecialidad: string;
}
