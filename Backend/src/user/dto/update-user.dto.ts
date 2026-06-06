import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString({ message: 'El nombre de usuario debe ser un texto' })
  @IsOptional()
  username: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsOptional()
  password: string;

  @IsString({ message: 'El nombre completo debe ser un texto' })
  @IsOptional()
  fullName: string;

  @IsString({ message: 'El rol debe ser un texto' })
  @IsOptional()
  role: string;
}
