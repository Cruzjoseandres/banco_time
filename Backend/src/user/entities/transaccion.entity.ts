import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Transaccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  monto: number;

  @Column()
  tipo: 'debito' | 'credito';

  @Column()
  motivo: string;

  @CreateDateColumn()
  fecha: Date;

  @ManyToOne(() => User, (user) => user.transacciones, { onDelete: 'CASCADE' })
  usuario: User;
}
