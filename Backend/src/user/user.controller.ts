import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ValidationGuard } from '../auth/validation.guard';
import { EspecialidadesDto } from 'src/especialidad/dto/especialidades.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('search')
  searchUsers(
    @Query('q') q?: string,
    @Query('rating') rating?: number,
    @Query('materia') materia?: string,
    @Query('especialidad') especialidad?: string,
  ) {
    return this.userService.searchUsers({ q, rating, materia, especialidad });
  }

  @Get('suggestions')
  getSuggestions(@Query('limit') limit?: number) {
    return this.userService.getSuggestions(limit ? Number(limit) : undefined);
  }

  @Get('transacciones')
  @UseGuards(AuthGuard)
  getTransacciones(@Request() req) {
    return this.userService.findTransaccionesByUsuario(req.user.id);
  }

  // El usuario autenticado se asigna a sí mismo una o varias especialidades
  @Post('me/especialidades')
  @UseGuards(AuthGuard)
  asignarMisEspecialidades(@Request() req, @Body() especialidades: EspecialidadesDto) {
    return this.userService.asignarEspecialidad(req.user.id, especialidades);
  }

  // El usuario autenticado se desasigna de una o varias especialidades
  @Delete('me/especialidades')
  @UseGuards(AuthGuard)
  desasignarMisEspecialidades(@Request() req, @Body() especialidades: EspecialidadesDto) {
    return this.userService.desasignarEspecialidad(req.user.id, especialidades);
  }

  // El usuario autenticado guarda sus materias seleccionadas
  @Patch('me/materias')
  @UseGuards(AuthGuard)
  updateMisMaterias(@Request() req, @Body('materiaIds') materiaIds: number[]) {
    return this.userService.updateMisMaterias(req.user.id, materiaIds || []);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }


  @UseGuards(AuthGuard, ValidationGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard, ValidationGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @Post('asignar/:id')
  @UseGuards(AuthGuard, ValidationGuard)
  asignarEspecialidad(@Param('id') id: number, @Body() especialidades: EspecialidadesDto) {
    return this.userService.asignarEspecialidad(id, especialidades);
  }

  @Delete('desasignar/:id')
  @UseGuards(AuthGuard, ValidationGuard)
  desasignarEspecialidad(@Param('id') id: number, @Body() especialidades: EspecialidadesDto) {
    return this.userService.desasignarEspecialidad(id, especialidades);
  }
}
