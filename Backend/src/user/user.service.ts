import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { Transaccion } from './entities/transaccion.entity';
import { Repository, In } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { EspecialidadesDto } from 'src/especialidad/dto/especialidades.dto';
import { Materia } from '../materia/entities/materia.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Especialidad)
    private readonly especialidadRepository: Repository<Especialidad>,
    @InjectRepository(Transaccion)
    private readonly transaccionRepository: Repository<Transaccion>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const usuarioexistente = await this.findByUsername(createUserDto.username)
    if (usuarioexistente) {
      throw new ConflictException(`El nombre de usuario ${createUserDto.username} ya está en uso`);
    }
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    return await this.userRepository.save(createUserDto);
  }

  async findAll() {
    return await this.userRepository.find({ relations: ['especialidades'] });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['especialidades', 'especialidades.materias', 'materias'],
    });
    if (!user) {
      throw new NotFoundException(`Usuario no encontrado`);
    }
    return user;
  }

  async findByUsername(username: string) {
    return await this.userRepository.findOne({
      where: { username },
      relations: ['especialidades', 'materias'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['especialidades', 'materias'],
    });
    if (!user) {
      throw new NotFoundException(`Usuario no encontrado`);
    }
    user.especialidades = [];
    user.materias = [];
    await this.userRepository.save(user);
    await this.userRepository.delete(id);
  }

  async updateMisMaterias(idUser: number, materiaIds: number[]) {
    const user = await this.findOne(idUser);
    
    // Buscar materias en la BD
    const materiasParaAsignar = await this.userRepository.manager.find(Materia, {
      where: { id: In(materiaIds) }
    });

    user.materias = materiasParaAsignar;
    return await this.userRepository.save(user);
  }

  async asignarEspecialidad(idUser: number, especialidadesDto: EspecialidadesDto) {
    const user = await this.findOne(idUser);
    
    // Obtener las especialidades de la BD para asegurar que existen
    const especialidadesParaAsignar = await this.especialidadRepository.find({
      where: {
        id: In(especialidadesDto.especialidadesIds),
      },
    });

    // Combinar evitando duplicados
    const currentSpecialtyIds = user.especialidades.map(e => e.id);
    const newSpecialties = especialidadesParaAsignar.filter(e => !currentSpecialtyIds.includes(e.id));
    user.especialidades = [...user.especialidades, ...newSpecialties];

    return await this.userRepository.save(user);
  }

  async desasignarEspecialidad(idUser: number, especialidadesDto: EspecialidadesDto) {
    const user = await this.findOne(idUser);

    // Filtrar para remover las especialidades especificadas
    user.especialidades = user.especialidades.filter(
      e => !especialidadesDto.especialidadesIds.includes(e.id)
    );

    return await this.userRepository.save(user);
  }

  async searchUsers(filters: {
    q?: string;
    rating?: number;
    materia?: string;
    especialidad?: string;
  }) {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .innerJoinAndSelect('user.especialidades', 'especialidad')
      .leftJoinAndSelect('especialidad.materias', 'especialidadMateria')
      .innerJoinAndSelect('user.materias', 'materia');

    // Solo buscar usuarios comunes (tutores/estudiantes), no administradores
    queryBuilder.andWhere('user.role = :role', { role: 'user' });

    // Filtrar por puntuación mínima
    if (filters.rating) {
      queryBuilder.andWhere('user.promedioCalificacion >= :rating', { rating: Number(filters.rating) });
    }

    // Filtrar por especialidad (id o nombre)
    if (filters.especialidad) {
      if (!isNaN(Number(filters.especialidad))) {
        queryBuilder.andWhere('especialidad.id = :especialidadId', { especialidadId: Number(filters.especialidad) });
      } else {
        queryBuilder.andWhere('especialidad.detalleEspecialidad LIKE :especialidadName', { especialidadName: `%${filters.especialidad}%` });
      }
    }

    // Filtrar por materia (id o nombre)
    if (filters.materia) {
      if (!isNaN(Number(filters.materia))) {
        queryBuilder.andWhere('materia.id = :materiaId', { materiaId: Number(filters.materia) });
      } else {
        queryBuilder.andWhere('materia.detalleMateria LIKE :materiaName', { materiaName: `%${filters.materia}%` });
      }
    }

    // Búsqueda textual general
    if (filters.q) {
      queryBuilder.andWhere(
        '(user.fullName LIKE :q OR user.username LIKE :q OR especialidad.detalleEspecialidad LIKE :q OR materia.detalleMateria LIKE :q)',
        { q: `%${filters.q}%` }
      );
    }

    return await queryBuilder.getMany();
  }

  async getSuggestions(limit: number = 6) {
    return await this.userRepository.createQueryBuilder('user')
      .innerJoinAndSelect('user.especialidades', 'especialidad')
      .leftJoinAndSelect('especialidad.materias', 'especialidadMateria')
      .innerJoinAndSelect('user.materias', 'materia')
      .where('user.role = :role', { role: 'user' })
      .orderBy('user.promedioCalificacion', 'DESC')
      .addOrderBy('user.totalTutoriasRealizadas', 'DESC')
      .take(limit)
      .getMany();
  }

  async findTransaccionesByUsuario(userId: number) {
    return await this.transaccionRepository.find({
      where: { usuario: { id: userId } },
      order: { fecha: 'DESC' },
    });
  }

  async seedAdmin() {
    const admin = await this.findByUsername('admin');
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = this.userRepository.create({
        username: 'admin',
        password: hashedPassword,
        fullName: 'Administrador del Sistema',
        role: 'admin',
        saldoHoras: 999,
        imagenPerfil: '',
        telefono: '',
      });
      await this.userRepository.save(newAdmin);
      console.log('Admin user seeded successfully (admin / admin123).');
    }
  }
}

