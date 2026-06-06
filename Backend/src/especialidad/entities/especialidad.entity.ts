import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Materia } from '../../materia/entities/materia.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Especialidad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  detalleEspecialidad: string;

  // Muchas Especialidades -> Pertenecen a Muchos Usuarios
  @ManyToMany(() => User, (user) => user.especialidades)
  users: User[];

  // Muchas Especialidades -> Tienen Muchas Materias
  @ManyToMany(() => Materia, (materia) => materia.especialidad)
  @JoinTable() // Agregamos JoinTable aquí para crear la tabla de unión entre Especialidad y Materia
  materias: Materia[];
}
