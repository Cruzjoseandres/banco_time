import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { CitaService } from './cita.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('cita')
@UseGuards(AuthGuard)
export class CitaController {
  constructor(private readonly citaService: CitaService) {}

  @Post()
  create(@Request() req, @Body() createCitaDto: CreateCitaDto) {
    return this.citaService.create(req.user.id, createCitaDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.citaService.findAllByUsuario(req.user.id);
  }

  @Get('admin/reportes')
  @UseGuards(AdminGuard)
  getAdminReportes() {
    return this.citaService.getReportesSociales();
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.citaService.findOne(req.user.id, +id);
  }

  @Patch(':id/responder')
  responderCita(
    @Request() req,
    @Param('id') id: string,
    @Body('estado') estado: 'aceptada' | 'rechazada',
  ) {
    return this.citaService.responderCita(req.user.id, +id, estado);
  }

  @Patch(':id/iniciar')
  iniciarCita(@Request() req, @Param('id') id: string) {
    return this.citaService.iniciarCita(req.user.id, +id);
  }

  @Patch(':id/terminar')
  terminarCita(
    @Request() req,
    @Param('id') id: string,
    @Body('codigo') codigo: string,
  ) {
    return this.citaService.terminarCita(req.user.id, +id, codigo);
  }

  @Patch(':id/cancelar')
  cancelarCita(@Request() req, @Param('id') id: string) {
    return this.citaService.cancelarCita(req.user.id, +id);
  }

  @Patch(':id/calificar')
  calificarCita(
    @Request() req,
    @Param('id') id: string,
    @Body('calificacion') calificacion: number,
    @Body('comentario') comentario?: string,
  ) {
    return this.citaService.calificarCita(req.user.id, +id, calificacion, comentario);
  }
}
