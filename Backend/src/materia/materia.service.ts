import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Materia } from './entities/materia.entity';
import { SolicitudMateria } from './entities/solicitud-materia.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MateriaService {
  constructor(
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
    @InjectRepository(SolicitudMateria)
    private readonly solicitudRepository: Repository<SolicitudMateria>,
    @InjectRepository(Especialidad)
    private readonly especialidadRepository: Repository<Especialidad>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createMateriaDto: CreateMateriaDto) {
    const materiaExistente = await this.materiaRepository.findOneBy({
      detalleMateria: createMateriaDto.detalleMateria,
    });
    if (materiaExistente) {
      throw new ConflictException(`La materia ${createMateriaDto.detalleMateria} ya está registrada.`);
    }
    return await this.materiaRepository.save(createMateriaDto);
  }

  async findAll() {
    return await this.materiaRepository.find();
  }

  async findOne(id: number) {
    const materia = await this.materiaRepository.findOneBy({ id });
    if (!materia) {
      throw new NotFoundException(`Materia no encontrada.`);
    }
    return materia;
  }

  async update(id: number, updateMateriaDto: UpdateMateriaDto) {
    await this.findOne(id);
    await this.materiaRepository.update(id, updateMateriaDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const materia = await this.materiaRepository.findOne({
      where: { id },
      relations: ['especialidad'],
    });
    if (!materia) {
      throw new NotFoundException(`Materia no encontrada.`);
    }
    materia.especialidad = [];
    await this.materiaRepository.save(materia);
    await this.materiaRepository.delete(id);
  }

  // --- FLUJO DE SOLICITUDES DE MATERIAS ---

  async solicitarMateria(userId: number, detalleMateria: string, especialidadId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const especialidad = await this.especialidadRepository.findOneBy({ id: especialidadId });
    if (!especialidad) {
      throw new NotFoundException('Especialidad no encontrada');
    }

    const nuevaSolicitud = this.solicitudRepository.create({
      detalleMateria,
      usuario: user,
      especialidad,
      estado: 'pendiente'
    });

    return await this.solicitudRepository.save(nuevaSolicitud);
  }

  async getSolicitudes() {
    return await this.solicitudRepository.find({
      relations: ['usuario', 'especialidad'],
      order: { fechaCreacion: 'DESC' }
    });
  }

  async responderSolicitud(solicitudId: number, estado: string) {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: solicitudId },
      relations: ['usuario', 'especialidad', 'especialidad.materias', 'usuario.materias'],
    });
    if (!solicitud) {
      throw new NotFoundException(`Solicitud no encontrada`);
    }

    solicitud.estado = estado;

    if (estado === 'aprobada') {
      // 1. Buscar o crear la Materia
      let materia = await this.materiaRepository.findOne({
        where: { detalleMateria: solicitud.detalleMateria }
      });
      if (!materia) {
        materia = this.materiaRepository.create({
          detalleMateria: solicitud.detalleMateria
        });
        materia = await this.materiaRepository.save(materia);
      }

      // 2. Vincular materia a la Especialidad
      const especialidad = solicitud.especialidad;
      if (!especialidad.materias) especialidad.materias = [];
      if (!especialidad.materias.some(m => m.id === materia.id)) {
        especialidad.materias.push(materia);
        await this.especialidadRepository.save(especialidad);
      }

      // 3. Vincular materia al Usuario solicitante
      const usuario = solicitud.usuario;
      if (!usuario.materias) usuario.materias = [];
      if (!usuario.materias.some(m => m.id === materia.id)) {
        usuario.materias.push(materia);
        await this.userRepository.save(usuario);
      }
    }

    return await this.solicitudRepository.save(solicitud);
  }
}
