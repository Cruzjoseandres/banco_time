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

    const allTutors = await queryBuilder.getMany();

    // Aplicar filtros en memoria con soporte de búsqueda difusa (fuzzy search) y checklist de especialidades
    let filtered = allTutors;

    // Filtro por especialidad (soporta IDs separados por coma)
    if (filters.especialidad) {
      const specIds = filters.especialidad.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));
      if (specIds.length > 0) {
        filtered = filtered.filter(user => 
          user.especialidades?.some(e => specIds.includes(e.id))
        );
      } else {
        filtered = filtered.filter(user => 
          user.especialidades?.some(e => matchesFuzzy(e.detalleEspecialidad, filters.especialidad))
        );
      }
    }

    // Filtro por materia (ID o búsqueda exacta/fuzzy)
    if (filters.materia) {
      if (!isNaN(Number(filters.materia))) {
        const matId = Number(filters.materia);
        filtered = filtered.filter(user => 
          user.materias?.some(m => m.id === matId)
        );
      } else {
        filtered = filtered.filter(user => 
          user.materias?.some(m => matchesFuzzy(m.detalleMateria, filters.materia))
        );
      }
    }

    // Filtro de búsqueda textual general `q` (búsqueda profesional difusa tolerante a errores)
    if (filters.q) {
      filtered = filtered.filter(user => {
        if (matchesFuzzy(user.fullName, filters.q)) return true;
        if (matchesFuzzy(user.username, filters.q)) return true;
        if (user.especialidades?.some(e => matchesFuzzy(e.detalleEspecialidad, filters.q))) return true;
        if (user.materias?.some(m => matchesFuzzy(m.detalleMateria, filters.q))) return true;
        return false;
      });
    }

    return filtered;
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

// --- FUNCIONES AUXILIARES PARA BÚSQUEDA DIFUSA (FUZZY SEARCH) ---

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remueve acentos / diacríticos
    .replace(/[^a-z0-9 ]/g, "")      // Remueve caracteres especiales
    .trim();
}

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // Eliminación
          dp[i][j - 1] + 1,    // Inserción
          dp[i - 1][j - 1] + 1 // Sustitución
        );
      }
    }
  }
  return dp[m][n];
}

function matchesFuzzy(target: string, query?: string): boolean {
  if (!query) return true;
  
  const normTarget = normalize(target);
  const normQuery = normalize(query);
  
  // 1. Coincidencia exacta o subcadena directa
  if (normTarget.includes(normQuery)) return true;
  
  // 2. Coincidencia sin espacios (para casos como "estructuradedatos")
  const noSpaceTarget = normTarget.replace(/\s+/g, '');
  const noSpaceQuery = normQuery.replace(/\s+/g, '');
  if (noSpaceTarget.includes(noSpaceQuery)) return true;
  
  // 3. Comparación difusa palabra por palabra
  const targetWords = normTarget.split(/\s+/);
  const queryWords = normQuery.split(/\s+/);
  
  // Cada palabra de la consulta debe coincidir difusamente con alguna palabra del objetivo
  return queryWords.every(qWord => {
    if (qWord.length < 3) {
      // Para palabras muy cortas (de 1 o 2 letras), requerir subcadena exacta
      return targetWords.some(tWord => tWord.includes(qWord));
    }
    
    return targetWords.some(tWord => {
      // Subcadena exacta
      if (tWord.includes(qWord) || qWord.includes(tWord)) return true;
      
      // Distancia de Levenshtein (tolerancia a errores ortográficos)
      const dist = levenshteinDistance(qWord, tWord);
      const maxAllowedDist = qWord.length >= 7 ? 2 : 1; // 2 fallos para palabras largas, 1 para cortas
      return dist <= maxAllowedDist;
    });
  });
}

