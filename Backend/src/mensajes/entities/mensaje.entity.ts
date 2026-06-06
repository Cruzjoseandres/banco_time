import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Conversacion } from './conversacion.entity';
import { Cita } from '../../cita/entities/cita.entity';

@Entity()
export class Mensaje {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  detalleMensaje: string;

  @CreateDateColumn()
  fechaEnvio: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'emisorId' })
  emisor: User;

  @ManyToOne(() => Conversacion, (conversacion) => conversacion.mensajes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversacionId' })
  conversacion: Conversacion;

  @ManyToOne(() => Cita, (cita) => cita.mensajes, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'citaId' })
  cita: Cita;
}
