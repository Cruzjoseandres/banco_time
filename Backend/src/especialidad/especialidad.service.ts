import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Especialidad } from './entities/especialidad.entity';
import { Materia } from '../materia/entities/materia.entity';
import { Repository, In } from 'typeorm';
import { MateriasDto } from '../materia/dto/materias.dto';

@Injectable()
export class EspecialidadService {
  constructor(
    @InjectRepository(Especialidad)
    private readonly especialidadRepository: Repository<Especialidad>,
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
  ) { }

  async create(createEspecialidadDto: CreateEspecialidadDto) {
    const especialidadExistente = await this.especialidadRepository.findOneBy({ detalleEspecialidad: createEspecialidadDto.detalleEspecialidad });
    if (especialidadExistente) {
      throw new ConflictException(`La especialidad ${createEspecialidadDto.detalleEspecialidad} ya está registrada`);
    }
    return await this.especialidadRepository.save(createEspecialidadDto);
  }

  async findAll() {
    return await this.especialidadRepository.find({ relations: ['materias'] });
  }

  async findOne(id: number) {
    const especialidad = await this.especialidadRepository.findOne({
      where: { id },
      relations: ['materias'],
    });
    if (!especialidad) {
      throw new NotFoundException(`Especialidad no encontrada`);
    }
    return especialidad;
  }

  async update(id: number, updateEspecialidadDto: UpdateEspecialidadDto) {
    await this.findOne(id);
    await this.especialidadRepository.update(id, updateEspecialidadDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const especialidad = await this.especialidadRepository.findOne({
      where: { id },
      relations: ['materias', 'users'],
    });
    if (!especialidad) {
      throw new NotFoundException(`Especialidad no encontrada`);
    }
    especialidad.users = [];
    especialidad.materias = [];
    await this.especialidadRepository.save(especialidad);
    await this.especialidadRepository.delete(id);
  }

  async asignarMaterias(idEspecialidad: number, materiasDto: MateriasDto) {
    const especialidad = await this.findOne(idEspecialidad);

    const materiasParaAsignar = await this.materiaRepository.find({
      where: {
        id: In(materiasDto.materiasIds),
      },
    });

    const currentMateriaIds = especialidad.materias.map(m => m.id);
    const newMaterias = materiasParaAsignar.filter(m => !currentMateriaIds.includes(m.id));
    especialidad.materias = [...especialidad.materias, ...newMaterias];

    return await this.especialidadRepository.save(especialidad);
  }

  async desasignarMaterias(idEspecialidad: number, materiasDto: MateriasDto) {
    const especialidad = await this.findOne(idEspecialidad);

    especialidad.materias = especialidad.materias.filter(
      m => !materiasDto.materiasIds.includes(m.id)
    );

    return await this.especialidadRepository.save(especialidad);
  }
}
