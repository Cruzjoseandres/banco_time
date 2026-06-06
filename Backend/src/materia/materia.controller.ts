import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MateriaService } from './materia.service';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('materia')
export class MateriaController {
  constructor(private readonly materiaService: MateriaService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  create(@Body() createMateriaDto: CreateMateriaDto) {
    return this.materiaService.create(createMateriaDto);
  }

  @Get()
  findAll() {
    return this.materiaService.findAll();
  }

  // --- Endpoints de Solicitud de Materias ---

  // Tutor solicita agregar una materia a una especialidad
  @Post('solicitar')
  @UseGuards(AuthGuard)
  solicitarMateria(
    @Request() req,
    @Body('detalleMateria') detalleMateria: string,
    @Body('especialidadId') especialidadId: number,
  ) {
    return this.materiaService.solicitarMateria(req.user.id, detalleMateria, especialidadId);
  }

  // Admin obtiene el listado de solicitudes
  @Get('solicitudes')
  @UseGuards(AuthGuard, AdminGuard)
  getSolicitudes() {
    return this.materiaService.getSolicitudes();
  }

  // Admin aprueba o rechaza una solicitud
  @Patch('solicitudes/:id/responder')
  @UseGuards(AuthGuard, AdminGuard)
  responderSolicitud(
    @Param('id') id: number,
    @Body('estado') estado: string, // 'aprobada' | 'rechazada'
  ) {
    return this.materiaService.responderSolicitud(Number(id), estado);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materiaService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() updateMateriaDto: UpdateMateriaDto) {
    return this.materiaService.update(+id, updateMateriaDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.materiaService.remove(+id);
  }
}
