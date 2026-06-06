import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import { CreateConversacionDto } from './dto/create-conversacion.dto';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('mensajes')
@UseGuards(AuthGuard)
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  @Post('conversacion')
  iniciarConversacion(@Request() req, @Body() createConversacionDto: CreateConversacionDto) {
    return this.mensajesService.iniciarConversacion(req.user.id, createConversacionDto);
  }

  @Get('conversaciones')
  obtenerConversacionesUsuario(@Request() req) {
    return this.mensajesService.obtenerConversacionesUsuario(req.user.id);
  }

  @Get('conversacion/:id')
  obtenerMensajesConversacion(@Request() req, @Param('id') id: string) {
    return this.mensajesService.obtenerMensajesConversacion(req.user.id, +id);
  }

  @Post()
  enviarMensaje(@Request() req, @Body() createMensajeDto: CreateMensajeDto) {
    return this.mensajesService.enviarMensaje(req.user.id, createMensajeDto);
  }
}
