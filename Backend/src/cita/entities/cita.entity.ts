import { Mensaje } from "src/mensajes/entities/mensaje.entity";
import { User } from "src/user/entities/user.entity";
import { Materia } from "src/materia/entities/materia.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cita {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    fechaHoraInicio: Date;
    @Column()
    fechaHoraFin: Date;
    @Column()
    estado: string;
    @Column()
    descripcion: string;
    @Column()
    longitud: string;
    @Column()
    latitud: string;
    @Column({ type: 'varchar', nullable: true })
    codigoConfirmacion: string | null;

    @Column({ type: 'float', nullable: true })
    calificacion: number | null;

    @Column({ type: 'varchar', nullable: true })
    comentarioCalificacion: string | null;

    //Muchas Citas -> Un Estudiante
    @ManyToOne(() => User, (user) => user.citasEstudiante, { nullable: false })
    @JoinColumn({ name: 'estudianteId' })
    estudiante: User;

    //Muchas Citas -> Un Tutor
    @ManyToOne(() => User, (user) => user.citasTutor, { nullable: false })
    @JoinColumn({ name: 'tutorId' })
    tutor: User;

    //Una Cita -> Muchos Mensajes
    @OneToMany(() => Mensaje, (mensaje) => mensaje.cita)
    mensajes: Mensaje[];

    @ManyToOne(() => Materia, { nullable: true })
    @JoinColumn({ name: 'materiaId' })
    materia: Materia;
}
