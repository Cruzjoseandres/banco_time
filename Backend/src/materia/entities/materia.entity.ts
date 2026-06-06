import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Especialidad } from '../../especialidad/entities/especialidad.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Materia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  detalleMateria: string;

  // Muchas Materias -> Pertenecen a Muchas Especialidades
  @ManyToMany(() => Especialidad, (especialidad) => especialidad.materias)
  especialidad: Especialidad[];

  // Muchas Materias -> Pertenecen a Muchos Usuarios
  @ManyToMany(() => User, (user) => user.materias)
  users: User[];
}
