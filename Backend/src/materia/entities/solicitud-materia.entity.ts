import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Especialidad } from '../../especialidad/entities/especialidad.entity';

@Entity()
export class SolicitudMateria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  detalleMateria: string;

  @Column({ default: 'pendiente' })
  estado: string; // 'pendiente' | 'aprobada' | 'rechazada'

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  usuario: User;

  @ManyToOne(() => Especialidad, { onDelete: 'CASCADE' })
  especialidad: Especialidad;

  @CreateDateColumn()
  fechaCreacion: Date;
}
