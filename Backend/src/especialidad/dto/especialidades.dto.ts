

import { IsArray, IsInt, IsNotEmpty } from "class-validator";

export class EspecialidadesDto {
    @IsArray()
    @IsInt({ each: true })
    @IsNotEmpty()
    especialidadesIds: number[];
}
