import { Cita } from 'src/cita/entities/cita.entity';
import { Especialidad } from 'src/especialidad/entities/especialidad.entity';
import { Mensaje } from 'src/mensajes/entities/mensaje.entity';
import { Materia } from 'src/materia/entities/materia.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transaccion } from './transaccion.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  username: string;
  @Column()
  password: string;
  @Column()
  fullName: string;
  @Column({ type: 'float', default: 5 })
  saldoHoras: number = 5;
  @Column({ default: 'user' })
  role: string;
  @Column({ nullable: true, default: '' })
  imagenPerfil: string;
  @Column({ nullable: true })
  telefono: string;
  @Column({ default: 0 })
  totalTutoriasRealizadas: number;
  @Column({ type: 'float', default: 0 })
  promedioCalificacion: number;

  @ManyToMany(() => Especialidad, (especialidad) => especialidad.users, { nullable: false })
  @JoinTable()
  especialidades: Especialidad[];

  @ManyToMany(() => Materia, (materia) => materia.users, { nullable: false })
  @JoinTable()
  materias: Materia[];

  //Muchos Usuarios -> Muchas Citas
  @ManyToMany(() => Cita, (cita) => cita.estudiante)
  citasEstudiante: Cita[];
  //Muchos Usuarios -> Muchas Citas
  @ManyToMany(() => Cita, (cita) => cita.tutor)
  citasTutor: Cita[];

  // Un usuario -> Muchos mensajes
  @OneToMany(() => Mensaje, (mensaje) => mensaje.emisor)
  mensajesEnviados: Mensaje[];

  @OneToMany(() => Transaccion, (transaccion) => transaccion.usuario)
  transacciones: Transaccion[];
}
