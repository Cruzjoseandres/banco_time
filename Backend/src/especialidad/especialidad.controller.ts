import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EspecialidadService } from './especialidad.service';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';
import { MateriasDto } from '../materia/dto/materias.dto';

@Controller('especialidad')
export class EspecialidadController {
  constructor(private readonly especialidadService: EspecialidadService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createEspecialidadDto: CreateEspecialidadDto) {
    return this.especialidadService.create(createEspecialidadDto);
  }

  @Get()
  findAll() {
    return this.especialidadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.especialidadService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard,AdminGuard)
  update(@Param('id') id: string, @Body() updateEspecialidadDto: UpdateEspecialidadDto) {
    return this.especialidadService.update(+id, updateEspecialidadDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard,AdminGuard)
  remove(@Param('id') id: string) {
    return this.especialidadService.remove(+id);
  }

  @Post('asignar-materias/:id')
  @UseGuards(AuthGuard, AdminGuard)
  asignarMaterias(@Param('id') id: number, @Body() materiasDto: MateriasDto) {
    return this.especialidadService.asignarMaterias(id, materiasDto);
  }

  @Delete('desasignar-materias/:id')
  @UseGuards(AuthGuard, AdminGuard)
  desasignarMaterias(@Param('id') id: number, @Body() materiasDto: MateriasDto) {
    return this.especialidadService.desasignarMaterias(id, materiasDto);
  }
}
