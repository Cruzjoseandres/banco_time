import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Materia } from '../../materia/entities/materia.entity';
import { Mensaje } from './mensaje.entity';

@Entity()
export class Conversacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'estudianteId' })
  estudiante: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tutorId' })
  tutor: User;

  @ManyToOne(() => Materia)
  @JoinColumn({ name: 'materiaId' })
  materia: Materia;

  @OneToMany(() => Mensaje, (mensaje) => mensaje.conversacion, { cascade: true })
  mensajes: Mensaje[];

  @CreateDateColumn()
  createdAt: Date;
}
