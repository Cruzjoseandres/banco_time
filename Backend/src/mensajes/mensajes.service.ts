import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mensaje } from './entities/mensaje.entity';
import { Conversacion } from './entities/conversacion.entity';
import { User } from '../user/entities/user.entity';
import { Materia } from '../materia/entities/materia.entity';
import { CreateConversacionDto } from './dto/create-conversacion.dto';
import { CreateMensajeDto } from './dto/create-mensaje.dto';

@Injectable()
export class MensajesService {
  constructor(
    @InjectRepository(Mensaje)
    private readonly mensajeRepository: Repository<Mensaje>,
    @InjectRepository(Conversacion)
    private readonly conversacionRepository: Repository<Conversacion>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
  ) {}

  async iniciarConversacion(estudianteId: number, createConversacionDto: CreateConversacionDto) {
    const { tutorId, materiaId } = createConversacionDto;

    if (estudianteId === tutorId) {
      throw new BadRequestException('No puedes iniciar una conversación contigo mismo.');
    }

    const tutor = await this.userRepository.findOneBy({ id: tutorId });
    if (!tutor) {
      throw new NotFoundException('El tutor especificado no existe.');
    }

    const materia = await this.materiaRepository.findOneBy({ id: materiaId });
    if (!materia) {
      throw new NotFoundException('La materia especificada no existe.');
    }

    let conversacion = await this.conversacionRepository.findOne({
      where: [
        { estudiante: { id: estudianteId }, tutor: { id: tutorId }, materia: { id: materiaId } }
      ],
      relations: ['estudiante', 'tutor', 'materia'],
    });

    if (!conversacion) {
      const estudiante = await this.userRepository.findOneBy({ id: estudianteId });
      if (!estudiante) {
        throw new NotFoundException('El estudiante especificado no existe.');
      }
      conversacion = this.conversacionRepository.create({
        estudiante: estudiante!,
        tutor: tutor!,
        materia: materia!,
      });
      conversacion = await this.conversacionRepository.save(conversacion);
    }

    return conversacion;
  }

  async obtenerConversacionesUsuario(userId: number) {
    const conversaciones = await this.conversacionRepository.find({
      where: [
        { estudiante: { id: userId } },
        { tutor: { id: userId } }
      ],
      relations: ['estudiante', 'tutor', 'materia', 'mensajes', 'mensajes.emisor'],
      order: {
        createdAt: 'DESC'
      }
    });

    return conversaciones.map(c => {
      const sortedMessages = [...c.mensajes].sort((a, b) => b.fechaEnvio.getTime() - a.fechaEnvio.getTime());
      const ultimoMensaje = sortedMessages[0] || null;

      return {
        id: c.id,
        estudiante: {
          id: c.estudiante.id,
          username: c.estudiante.username,
          fullName: c.estudiante.fullName,
          imagenPerfil: c.estudiante.imagenPerfil
        },
        tutor: {
          id: c.tutor.id,
          username: c.tutor.username,
          fullName: c.tutor.fullName,
          imagenPerfil: c.tutor.imagenPerfil
        },
        materia: c.materia,
        ultimoMensaje: ultimoMensaje ? {
          id: ultimoMensaje.id,
          detalleMensaje: ultimoMensaje.detalleMensaje,
          fechaEnvio: ultimoMensaje.fechaEnvio,
          emisor: {
            id: ultimoMensaje.emisor.id,
            username: ultimoMensaje.emisor.username,
            fullName: ultimoMensaje.emisor.fullName
          }
        } : null,
        createdAt: c.createdAt
      };
    });
  }

  async obtenerMensajesConversacion(userId: number, conversacionId: number) {
    const conversacion = await this.conversacionRepository.findOne({
      where: { id: conversacionId },
      relations: ['estudiante', 'tutor', 'materia'],
    });

    if (!conversacion) {
      throw new NotFoundException('Conversación no encontrada.');
    }

    if (conversacion.estudiante.id !== userId && conversacion.tutor.id !== userId) {
      throw new ForbiddenException('No tienes permiso para ver esta conversación.');
    }

    return await this.mensajeRepository.find({
      where: { conversacion: { id: conversacionId } },
      relations: ['emisor'],
      order: { fechaEnvio: 'ASC' },
    });
  }

  async enviarMensaje(emisorId: number, createMensajeDto: CreateMensajeDto) {
    const { conversacionId, detalleMensaje } = createMensajeDto;

    const conversacion = await this.conversacionRepository.findOne({
      where: { id: conversacionId },
      relations: ['estudiante', 'tutor'],
    });

    if (!conversacion) {
      throw new NotFoundException('Conversación no encontrada.');
    }

    if (conversacion.estudiante.id !== emisorId && conversacion.tutor.id !== emisorId) {
      throw new ForbiddenException('No puedes enviar mensajes a esta conversación.');
    }

    const emisor = await this.userRepository.findOneBy({ id: emisorId });
    if (!emisor) {
      throw new NotFoundException('El emisor especificado no existe.');
    }

    const mensaje = this.mensajeRepository.create({
      detalleMensaje,
      emisor: emisor!,
      conversacion: conversacion!,
    });

    const mensajeGuardado = await this.mensajeRepository.save(mensaje);
    delete (mensajeGuardado as any).conversacion;
    return mensajeGuardado;
  }

  async obtenerConversacionPorId(id: number) {
    return await this.conversacionRepository.findOne({
      where: { id },
      relations: ['estudiante', 'tutor', 'materia'],
    });
  }
}
