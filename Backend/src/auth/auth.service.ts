import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { JwtService } from "@nestjs/jwt";
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserRegisterResponseDto } from './dto/register-response.dto';
import { UserInfoDto } from './dto/userinfo.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) { }

  async login(body: UserLoginDto): Promise<any> {
    const user = await this.usersService.findByUsername(body.username);
    if (!user) {
      throw new UnauthorizedException();
    }
    const hashedPassword = await bcrypt.compare(body.password, user.password);
    if (!hashedPassword) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.username, rol: user.role };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }


  async register(body: UserRegisterDto): Promise<UserRegisterResponseDto> {
    const newUser = await this.usersService.create(body);
    return { id: newUser.id, username: newUser.username, fullName: newUser.fullName, role: newUser.role } as UserRegisterResponseDto;
  }


  async getUserById(id: number): Promise<UserInfoDto> {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      saldoHoras: user.saldoHoras,
      totalTutoriasRealizadas: user.totalTutoriasRealizadas,
      promedioCalificacion: user.promedioCalificacion,
      imagenPerfil: user.imagenPerfil,
      telefono: user.telefono,
      especialidades: (user.especialidades || []).map(e => ({
        id: e.id,
        detalleEspecialidad: e.detalleEspecialidad,
      })),
      materias: (user.materias || []).map(m => ({
        id: m.id,
        detalleMateria: m.detalleMateria,
      })),
    } as UserInfoDto;
  }
}
