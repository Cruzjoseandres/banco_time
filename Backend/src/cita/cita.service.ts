import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Cita } from './entities/cita.entity';
import { User } from '../user/entities/user.entity';
import { Transaccion } from '../user/entities/transaccion.entity';
import { Materia } from '../materia/entities/materia.entity';
import { CreateCitaDto } from './dto/create-cita.dto';
import { MensajesGateway } from '../mensajes/mensajes.gateway';

@Injectable()
export class CitaService {
  constructor(
    @InjectRepository(Cita)
    private readonly citaRepository: Repository<Cita>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaccion)
    private readonly transaccionRepository: Repository<Transaccion>,
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
    private readonly mensajesGateway: MensajesGateway,
  ) {}

  private async registrarTransaccion(user: User, monto: number, tipo: 'debito' | 'credito', motivo: string) {
    const tx = this.transaccionRepository.create({
      usuario: user,
      monto,
      tipo,
      motivo,
    });
    await this.transaccionRepository.save(tx);
  }

  private notifyCita(cita: Cita, eventType: string) {
    if (this.mensajesGateway && this.mensajesGateway.server) {
      const payload = {
        citaId: cita.id,
        estado: cita.estado,
        fechaHoraInicio: cita.fechaHoraInicio,
        fechaHoraFin: cita.fechaHoraFin,
        descripcion: cita.descripcion,
        latitud: cita.latitud,
        longitud: cita.longitud,
        codigoConfirmacion: cita.codigoConfirmacion,
        calificacion: cita.calificacion,
        comentarioCalificacion: cita.comentarioCalificacion,
        estudiante: { id: cita.estudiante.id, fullName: cita.estudiante.fullName },
        tutor: { id: cita.tutor.id, fullName: cita.tutor.fullName },
        materia: cita.materia ? { id: cita.materia.id, detalleMateria: cita.materia.detalleMateria } : null,
      };
      this.mensajesGateway.server.to(`user_${cita.estudiante.id}`).emit('cita_notificacion', {
        type: eventType,
        data: payload,
      });
      this.mensajesGateway.server.to(`user_${cita.tutor.id}`).emit('cita_notificacion', {
        type: eventType,
        data: payload,
      });
    }
  }

  async create(estudianteId: number, createCitaDto: CreateCitaDto) {
    const { fechaHoraInicio, fechaHoraFin, descripcion, latitud, longitud, tutorId, materiaId } = createCitaDto;

    if (estudianteId === tutorId) {
      throw new BadRequestException('No puedes programar una cita contigo mismo.');
    }

    const inicio = new Date(fechaHoraInicio);
    const fin = new Date(fechaHoraFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new BadRequestException('Las fechas proporcionadas no son válidas.');
    }

    if (inicio >= fin) {
      throw new BadRequestException('La fecha y hora de fin debe ser posterior a la de inicio.');
    }

    const tutor = await this.userRepository.findOneBy({ id: tutorId });
    if (!tutor) {
      throw new NotFoundException('El tutor especificado no existe.');
    }

    const estudiante = await this.userRepository.findOneBy({ id: estudianteId });
    if (!estudiante) {
      throw new NotFoundException('El estudiante especificado no existe.');
    }

    const materia = materiaId ? await this.materiaRepository.findOneBy({ id: materiaId }) : null;

    const cita = this.citaRepository.create({
      fechaHoraInicio: inicio,
      fechaHoraFin: fin,
      descripcion,
      latitud,
      longitud,
      estado: 'pendiente',
      estudiante: estudiante!,
      tutor: tutor!,
      materia: materia!,
    });

    const savedCita = await this.citaRepository.save(cita);
    
    // Cargar con relaciones para notificar por websocket
    const citaConRelaciones = await this.citaRepository.findOne({
      where: { id: savedCita.id },
      relations: ['estudiante', 'tutor', 'materia'],
    });
    if (citaConRelaciones) {
      this.notifyCita(citaConRelaciones, 'creada');
    }

    return savedCita;
  }

  async responderCita(tutorId: number, citaId: number, estado: 'aceptada' | 'rechazada') {
    if (estado !== 'aceptada' && estado !== 'rechazada') {
      throw new BadRequestException('El estado debe ser "aceptada" o "rechazada".');
    }

    const cita = await this.citaRepository.findOne({
      where: { id: citaId },
      relations: ['tutor', 'estudiante', 'materia'],
    });

    if (!cita) {
      throw new NotFoundException('La cita especificada no existe.');
    }

    if (cita.tutor.id !== tutorId) {
      throw new ForbiddenException('No tienes permiso para responder a esta solicitud de cita.');
    }

    if (cita.estado !== 'pendiente') {
      throw new BadRequestException(`Esta cita ya ha sido respondida y se encuentra en estado "${cita.estado}".`);
    }

    if (estado === 'aceptada') {
      // Cobrar de forma anticipada al estudiante
      const duracionMs = cita.fechaHoraFin.getTime() - cita.fechaHoraInicio.getTime();
      const duracionHoras = duracionMs / (1000 * 60 * 60);
      const multiplicador = 1; // 1 crédito por hora
      const costo = duracionHoras * multiplicador;

      if (cita.estudiante.saldoHoras < costo) {
        throw new BadRequestException('El estudiante no cuenta con saldo de horas suficiente para confirmar esta tutoría.');
      }

      cita.estudiante.saldoHoras -= costo;
      await this.userRepository.save(cita.estudiante);
      
      await this.registrarTransaccion(
        cita.estudiante,
        costo,
        'debito',
        `Cobro anticipado por tutoría (Cita #${cita.id})`,
      );
    }

    cita.estado = estado;
    const savedCita = await this.citaRepository.save(cita);
    this.notifyCita(savedCita, estado);
    return savedCita;
  }

  async iniciarCita(tutorId: number, citaId: number) {
    const cita = await this.citaRepository.findOne({
      where: { id: citaId },
      relations: ['tutor', 'estudiante', 'materia'],
    });

    if (!cita) {
      throw new NotFoundException('La cita especificada no existe.');
    }

    if (cita.tutor.id !== tutorId) {
      throw new ForbiddenException('No eres el tutor asignado a esta cita.');
    }

    if (cita.estado !== 'aceptada') {
      throw new BadRequestException('La cita debe estar en estado "aceptada" para poder ser iniciada.');
    }

    // Generar un código numérico aleatorio de 4 dígitos
    const codigo = Math.floor(1000 + Math.random() * 9000).toString();
    cita.codigoConfirmacion = codigo;
    cita.estado = 'iniciada';

    const savedCita = await this.citaRepository.save(cita);
    this.notifyCita(savedCita, 'iniciada');
    return savedCita;
  }

  async terminarCita(tutorId: number, citaId: number, codigo: string) {
    const cita = await this.citaRepository.findOne({
      where: { id: citaId },
      relations: ['tutor', 'estudiante', 'materia'],
    });

    if (!cita) {
      throw new NotFoundException('La cita especificada no existe.');
    }

    if (cita.tutor.id !== tutorId) {
      throw new ForbiddenException('No eres el tutor asignado a esta cita.');
    }

    if (cita.estado !== 'iniciada') {
      throw new BadRequestException('La cita debe estar iniciada para poder ser finalizada.');
    }

    if (cita.codigoConfirmacion !== codigo) {
      throw new BadRequestException('El código de confirmación ingresado es incorrecto.');
    }

    // Calcular horas a transferir al tutor
    const duracionMs = cita.fechaHoraFin.getTime() - cita.fechaHoraInicio.getTime();
    const duracionHoras = duracionMs / (1000 * 60 * 60);
    const multiplicador = 1;
    const credito = duracionHoras * multiplicador;

    // Sumar horas al tutor e incrementar tutorías realizadas
    cita.tutor.saldoHoras += credito;
    cita.tutor.totalTutoriasRealizadas += 1;
    await this.userRepository.save(cita.tutor);

    await this.registrarTransaccion(
      cita.tutor,
      credito,
      'credito',
      `Pago por tutoría finalizada (Cita #${cita.id})`,
    );

    cita.estado = 'finalizada';
    const savedCita = await this.citaRepository.save(cita);
    this.notifyCita(savedCita, 'finalizada');
    return savedCita;
  }

  async cancelarCita(userId: number, citaId: number) {
    const cita = await this.citaRepository.findOne({
      where: { id: citaId },
      relations: ['estudiante', 'tutor', 'materia'],
    });

    if (!cita) {
      throw new NotFoundException('La cita especificada no existe.');
    }

    if (cita.estudiante.id !== userId && cita.tutor.id !== userId) {
      throw new ForbiddenException('No tienes permiso para cancelar esta cita.');
    }

    // Permitir cancelar solo citas en estado 'pendiente', 'aceptada' o 'iniciada'
    if (cita.estado !== 'pendiente' && cita.estado !== 'aceptada' && cita.estado !== 'iniciada') {
      throw new BadRequestException(`No se puede cancelar una cita en estado "${cita.estado}".`);
    }

    const estadoAnterior = cita.estado;
    cita.estado = 'cancelada';

    // Si la cita ya estaba aceptada o iniciada, aplicamos penalizaciones y reembolsos
    if (estadoAnterior === 'aceptada' || estadoAnterior === 'iniciada') {
      // 1. Penalización al usuario que cancela bajándole 0.5 a su calificación
      const usuarioQueCancela = cita.estudiante.id === userId ? cita.estudiante : cita.tutor;
      usuarioQueCancela.promedioCalificacion = Math.max(0, Number((usuarioQueCancela.promedioCalificacion - 0.5).toFixed(2)));
      await this.userRepository.save(usuarioQueCancela);

      // 2. Reembolso al estudiante: 100% si cancela el tutor, 50% si cancela el estudiante
      const duracionMs = cita.fechaHoraFin.getTime() - cita.fechaHoraInicio.getTime();
      const duracionHoras = duracionMs / (1000 * 60 * 60);
      const multiplicador = 1;
      const costoOriginal = duracionHoras * multiplicador;
      
      const esCanceladoPorTutor = cita.tutor.id === userId;
      const porcentajeReembolso = esCanceladoPorTutor ? 1.0 : 0.5;
      const reembolso = costoOriginal * porcentajeReembolso;

      cita.estudiante.saldoHoras = Number((cita.estudiante.saldoHoras + reembolso).toFixed(2));
      await this.userRepository.save(cita.estudiante);

      await this.registrarTransaccion(
        cita.estudiante,
        reembolso,
        'credito',
        esCanceladoPorTutor
          ? `Reembolso del 100% por cancelación del tutor (Cita #${cita.id})`
          : `Reembolso parcial del 50% por cancelación del estudiante (Cita #${cita.id})`,
      );
    }

    const savedCita = await this.citaRepository.save(cita);
    this.notifyCita(savedCita, 'cancelada');
    return savedCita;
  }

  async verificarExpiracionCitas(userId: number) {
    const now = new Date();
    const citasExpirables = await this.citaRepository.find({
      where: [
        { estudiante: { id: userId }, estado: 'pendiente' },
        { estudiante: { id: userId }, estado: 'aceptada' },
        { tutor: { id: userId }, estado: 'pendiente' },
        { tutor: { id: userId }, estado: 'aceptada' },
      ],
      relations: ['estudiante', 'tutor'],
    });

    for (const cita of citasExpirables) {
      if (cita.fechaHoraInicio < now) {
        if (cita.estado === 'pendiente') {
          cita.estado = 'expirada';
          const savedCita = await this.citaRepository.save(cita);
          this.notifyCita(savedCita, 'expirada');
        } else if (cita.estado === 'aceptada') {
          cita.estado = 'expirada';

          const duracionMs = cita.fechaHoraFin.getTime() - cita.fechaHoraInicio.getTime();
          const duracionHoras = duracionMs / (1000 * 60 * 60);
          const multiplicador = 1;
          const costo = duracionHoras * multiplicador;

          cita.estudiante.saldoHoras += costo;
          await this.userRepository.save(cita.estudiante);

          await this.registrarTransaccion(
            cita.estudiante,
            costo,
            'credito',
            `Reembolso del 100% por tutoría expirada (Cita #${cita.id})`,
          );

          const savedCita = await this.citaRepository.save(cita);
          this.notifyCita(savedCita, 'expirada');
        }
      }
    }
  }

  async findAllByUsuario(userId: number) {
    await this.verificarExpiracionCitas(userId);

    return await this.citaRepository.find({
      where: [
        { estudiante: { id: userId } },
        { tutor: { id: userId } }
      ],
      relations: ['estudiante', 'tutor', 'materia'],
      order: {
        fechaHoraInicio: 'DESC'
      }
    });
  }

  async findOne(userId: number, id: number) {
    const cita = await this.citaRepository.findOne({
      where: { id },
      relations: ['estudiante', 'tutor', 'materia'],
    });

    if (!cita) {
      throw new NotFoundException('Cita no encontrada.');
    }

    if (cita.estudiante.id !== userId && cita.tutor.id !== userId) {
      throw new ForbiddenException('No tienes permiso para acceder a esta cita.');
    }

    return cita;
  }

  async calificarCita(estudianteId: number, citaId: number, calificacion: number, comentario?: string) {
    if (calificacion < 1 || calificacion > 5) {
      throw new BadRequestException('La calificación debe estar entre 1 y 5.');
    }

    const cita = await this.citaRepository.findOne({
      where: { id: citaId },
      relations: ['estudiante', 'tutor'],
    });

    if (!cita) {
      throw new NotFoundException('La cita especificada no existe.');
    }

    if (cita.estudiante.id !== estudianteId) {
      throw new ForbiddenException('Solo el estudiante asignado a la cita puede calificar al tutor.');
    }

    if (cita.estado !== 'finalizada') {
      throw new BadRequestException('Solo puedes calificar tutorías que hayan finalizado.');
    }

    if (cita.calificacion !== null && cita.calificacion !== undefined) {
      throw new BadRequestException('Esta tutoría ya ha sido calificada.');
    }

    cita.calificacion = calificacion;
    cita.comentarioCalificacion = comentario || null;
    await this.citaRepository.save(cita);

    // Recalcular el promedio de calificación del tutor
    const tutorId = cita.tutor.id;
    const tutor = await this.userRepository.findOneBy({ id: tutorId });

    if (tutor) {
      const count = await this.citaRepository.count({
        where: {
          tutor: { id: tutorId },
          estado: 'finalizada',
          calificacion: Not(IsNull()),
        }
      });

      if (count > 1) {
        tutor.promedioCalificacion = Number(((tutor.promedioCalificacion * (count - 1) + calificacion) / count).toFixed(2));
      } else {
        tutor.promedioCalificacion = calificacion;
      }

      tutor.promedioCalificacion = Math.min(5, Math.max(0, tutor.promedioCalificacion));
      await this.userRepository.save(tutor);
    }

    this.notifyCita(cita, 'calificada');

    return cita;
  }

  async getReportesSociales() {
    const totalUsuarios = await this.userRepository.count();

    const allUsers = await this.userRepository.find({
      relations: ['especialidades', 'materias'],
    });

    const usersComunes = allUsers.filter(u => u.role !== 'admin');
    const totalTutors = usersComunes.filter(u => u.materias.length > 0 || u.especialidades.length > 0).length;
    const totalEstudiantes = usersComunes.length - totalTutors;

    const totalCitas = await this.citaRepository.count();

    const citasFinalizadas = await this.citaRepository.find({
      where: { estado: 'finalizada' },
      relations: ['estudiante', 'tutor', 'materia'],
    });

    let totalHorasIntercambiadas = 0;
    citasFinalizadas.forEach(cita => {
      const duracionMs = new Date(cita.fechaHoraFin).getTime() - new Date(cita.fechaHoraInicio).getTime();
      const duracionHoras = duracionMs / (1000 * 60 * 60);
      totalHorasIntercambiadas += duracionHoras;
    });
    totalHorasIntercambiadas = Number(totalHorasIntercambiadas.toFixed(2));

    const estudiantesIds = new Set(citasFinalizadas.map(c => c.estudiante.id));
    const tutoresIds = new Set(citasFinalizadas.map(c => c.tutor.id));

    const usuariosReciprocos = [...estudiantesIds].filter(id => tutoresIds.has(id));
    const todosUsuariosActivos = new Set([...estudiantesIds, ...tutoresIds]);

    const indiceReciprocidad = todosUsuariosActivos.size > 0
      ? Number(((usuariosReciprocos.length / todosUsuariosActivos.size) * 100).toFixed(1))
      : 0;

    const citasCalificadas = citasFinalizadas.filter(c => c.calificacion !== null && c.calificacion !== undefined);
    const calificacionPromedio = citasCalificadas.length > 0
      ? Number((citasCalificadas.reduce((acc, c) => acc + c.calificacion!, 0) / citasCalificadas.length).toFixed(2))
      : 0;

    const estadosCount = await this.citaRepository
      .createQueryBuilder('cita')
      .select('cita.estado', 'estado')
      .addSelect('COUNT(cita.id)', 'count')
      .groupBy('cita.estado')
      .getRawMany();

    const citasPorEstado: { [key: string]: number } = {};
    estadosCount.forEach(row => {
      citasPorEstado[row.estado] = parseInt(row.count, 10);
    });

    const materiasCount: { [key: string]: { id: number, name: string, count: number } } = {};
    citasFinalizadas.forEach(cita => {
      if (cita.materia) {
        const id = cita.materia.id;
        if (!materiasCount[id]) {
          materiasCount[id] = {
            id,
            name: cita.materia.detalleMateria,
            count: 0,
          };
        }
        materiasCount[id].count++;
      }
    });
    const topMaterias = Object.values(materiasCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ultimosMeses: { mesStr: string, count: number, horas: number, year: number, monthIdx: number }[] = [];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      ultimosMeses.push({
        mesStr: `${mesesNombres[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`,
        count: 0,
        horas: 0,
        year: d.getFullYear(),
        monthIdx: d.getMonth(),
      });
    }

    citasFinalizadas.forEach(cita => {
      const fecha = new Date(cita.fechaHoraInicio);
      const year = fecha.getFullYear();
      const month = fecha.getMonth();

      const match = ultimosMeses.find(m => m.year === year && m.monthIdx === month);
      if (match) {
        match.count++;
        const duracionMs = new Date(cita.fechaHoraFin).getTime() - new Date(cita.fechaHoraInicio).getTime();
        match.horas += duracionMs / (1000 * 60 * 60);
      }
    });

    const evolucionMensual = ultimosMeses.map(m => ({
      mes: m.mesStr,
      tutorias: m.count,
      horas: Number(m.horas.toFixed(1)),
    }));

    const comentariosRecientes = citasFinalizadas
      .filter(c => c.comentarioCalificacion && c.comentarioCalificacion.trim() !== '')
      .sort((a, b) => new Date(b.fechaHoraInicio).getTime() - new Date(a.fechaHoraInicio).getTime())
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        estudiante: c.estudiante.fullName,
        tutor: c.tutor.fullName,
        materia: c.materia ? c.materia.detalleMateria : 'Tutoría',
        calificacion: c.calificacion,
        comentario: c.comentarioCalificacion,
        fecha: new Date(c.fechaHoraInicio).toLocaleDateString('es-ES'),
      }));

    return {
      comunidad: {
        totalUsuarios,
        totalTutors,
        totalEstudiantes,
        totalActivos: todosUsuariosActivos.size,
      },
      impacto: {
        totalCitas,
        totalHorasIntercambiadas,
        calificacionPromedio,
        indiceReciprocidad,
      },
      citasPorEstado,
      topMaterias,
      evolucionMensual,
      comentariosRecientes,
    };
  }
}
