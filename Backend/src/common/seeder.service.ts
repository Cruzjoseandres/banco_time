import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Cita } from '../cita/entities/cita.entity';
import { Materia } from '../materia/entities/materia.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { Transaccion } from '../user/entities/transaccion.entity';
import { Conversacion } from '../mensajes/entities/conversacion.entity';
import { Mensaje } from '../mensajes/entities/mensaje.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Cita)
    private readonly citaRepository: Repository<Cita>,
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
    @InjectRepository(Especialidad)
    private readonly especialidadRepository: Repository<Especialidad>,
    @InjectRepository(Transaccion)
    private readonly transaccionRepository: Repository<Transaccion>,
    @InjectRepository(Conversacion)
    private readonly conversacionRepository: Repository<Conversacion>,
    @InjectRepository(Mensaje)
    private readonly mensajeRepository: Repository<Mensaje>,
  ) {}

  private async registrarTransaccion(user: User, monto: number, tipo: 'debito' | 'credito', motivo: string, fecha: Date) {
    const tx = this.transaccionRepository.create({
      usuario: user,
      monto,
      tipo,
      motivo,
      fecha,
    });
    await this.transaccionRepository.save(tx);
  }

  async seed() {
    console.log('[Seeder] Iniciando limpieza de base de datos...');
    
    const isPostgres = this.userRepository.manager.connection.options.type === 'postgres';
    if (!isPostgres) {
      await this.userRepository.query('PRAGMA foreign_keys = OFF;');
    }

    const tablesToClear = [
      'mensaje',
      'conversacion',
      'cita',
      'transaccion',
      'user_especialidades_especialidad',
      'user_materias_materia',
      'especialidad_materias_materia',
      'materia',
      'especialidad'
    ];

    for (const table of tablesToClear) {
      try {
        await this.userRepository.query(`DELETE FROM "${table}"`);
      } catch (err) {
        console.warn(`[Seeder] No se pudo borrar la tabla ${table} (tal vez no existe):`, err.message);
      }
    }

    await this.userRepository.delete({ username: Not('admin') });

    if (!isPostgres) {
      await this.userRepository.query('PRAGMA foreign_keys = ON;');
    }

    console.log('[Seeder] Base de datos limpia. Creando especialidades y materias...');

    // 2. Crear Especialidades y Materias
    const specsData = [
      {
        name: "Ingeniería de Sistemas",
        materias: ["Cálculo I", "Álgebra Lineal", "Programación I", "Base de Datos I", "Estructura de Datos"]
      },
      {
        name: "Medicina",
        materias: ["Anatomía I", "Fisiología", "Farmacología", "Bioquímica"]
      },
      {
        name: "Derecho",
        materias: ["Derecho Civil", "Derecho Penal", "Derecho Constitucional"]
      },
      {
        name: "Administración de Empresas",
        materias: ["Contabilidad I", "Microeconomía", "Administración I"]
      },
      {
        name: "Arquitectura",
        materias: ["Dibujo Técnico", "Historia de la Arquitectura", "Diseño Arquitectónico"]
      },
      {
        name: "Diseño Gráfico",
        materias: ["Ilustración Digital", "Diseño Vectorial", "Tipografía"]
      },
      {
        name: "Idiomas",
        materias: ["Inglés Técnico", "Francés Básico", "Alemán Básico"]
      }
    ];

    const savedSpecs: Especialidad[] = [];
    const savedMaterias: Materia[] = [];

    for (const spec of specsData) {
      const especialidad = this.especialidadRepository.create({ detalleEspecialidad: spec.name });
      const savedSpec = await this.especialidadRepository.save(especialidad);
      
      const materiasForSpec: Materia[] = [];
      for (const matName of spec.materias) {
        let materia = await this.materiaRepository.findOneBy({ detalleMateria: matName });
        if (!materia) {
          materia = this.materiaRepository.create({ detalleMateria: matName });
          materia = await this.materiaRepository.save(materia);
        }
        materiasForSpec.push(materia);
        if (!savedMaterias.some(m => m.id === materia.id)) {
          savedMaterias.push(materia);
        }
      }

      savedSpec.materias = materiasForSpec;
      const updatedSpec = await this.especialidadRepository.save(savedSpec);
      savedSpecs.push(updatedSpec);
    }

    console.log(`[Seeder] Creadas ${savedSpecs.length} especialidades y ${savedMaterias.length} materias.`);
    console.log('[Seeder] Creando 200 usuarios ficticios...');

    // Nombres realistas en español
    const firstNames = [
      "Juan", "Maria", "Jose", "Ana", "Luis", "Carlos", "Sofia", "Lucia", "Pedro", "Laura", 
      "Diego", "Elena", "Andres", "Clara", "Javier", "Isabella", "Miguel", "Gabriela", "Fernando", "Camila", 
      "Jorge", "Valentina", "Ricardo", "Paula", "Daniel", "Mariana", "Alejandro", "Sara", "Manuel", "Andrea",
      "Mateo", "Luciana", "Santiago", "Valentina", "Sebastian", "Camila", "Nicolas", "Isabella", "Gabriel", "Victoria"
    ];
    const lastNames = [
      "Gomez", "Perez", "Rodriguez", "Gonzalez", "Martinez", "Lopez", "Hernandez", "Diaz", "Torres", "Ramirez", 
      "Flores", "Benitez", "Acosta", "Medina", "Herrera", "Aguirre", "Guzman", "Castro", "Romero", "Silva", 
      "Sanchez", "Ortega", "Mendoza", "Rios", "Ruiz", "Morales", "Castillo", "Suarez", "Ortiz", "Mendez",
      "Vargas", "Rojas", "Jimenez", "Paredes", "Salazar", "Guzman", "Miranda", "Arias", "Flores", "Campos"
    ];

    // Pre-encriptar contraseña para ir rápido (todas serán password123)
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users: User[] = [];
    const tutors: User[] = [];

    for (let i = 1; i <= 200; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}`;
      
      const isTutor = Math.random() < 0.6; // 60% Tutores, 40% Estudiantes
      const user = this.userRepository.create({
        username,
        password: hashedPassword,
        fullName,
        role: 'user',
        saldoHoras: Number((Math.random() * 30 + 5).toFixed(2)), // Saldo inicial entre 5 y 35 horas
        telefono: `7${Math.floor(1000000 + Math.random() * 9000000)}`, // Teléfono 8 dígitos
        imagenPerfil: `https://randomuser.me/api/portraits/${Math.random() < 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`,
        totalTutoriasRealizadas: 0,
        promedioCalificacion: 0,
      });

      if (isTutor) {
        // Asignar 1-2 especialidades
        const numSpecs = Math.random() < 0.8 ? 1 : 2;
        const shuffledSpecs = [...savedSpecs].sort(() => 0.5 - Math.random());
        user.especialidades = shuffledSpecs.slice(0, numSpecs);

        // Asignar 2-4 materias de esas especialidades
        const availableMaterias: Materia[] = [];
        user.especialidades.forEach(sp => {
          if (sp.materias) {
            sp.materias.forEach(mat => {
              if (!availableMaterias.some(m => m.id === mat.id)) {
                availableMaterias.push(mat);
              }
            });
          }
        });
        const numMats = Math.min(availableMaterias.length, Math.floor(Math.random() * 3) + 2); // 2 a 4 materias
        const shuffledMats = availableMaterias.sort(() => 0.5 - Math.random());
        user.materias = shuffledMats.slice(0, numMats);
      } else {
        user.especialidades = [];
        user.materias = [];
      }

      const savedUser = await this.userRepository.save(user);
      users.push(savedUser);
      if (isTutor && savedUser.materias.length > 0) {
        tutors.push(savedUser);
      }
    }

    console.log(`[Seeder] Creados ${users.length} usuarios (${tutors.length} son tutores activos).`);
    console.log('[Seeder] Creando citas históricas (400 citas en los últimos 6 meses)...');

    // 4. Crear citas históricas (en los últimos 180 días)
    const estadosCitas = ['finalizada', 'finalizada', 'finalizada', 'finalizada', 'finalizada', 'cancelada', 'rechazada', 'aceptada', 'pendiente'];
    const descripcionesCitas = [
      "Ayuda con ejercicios para el examen parcial.",
      "Revisión de dudas en el proyecto práctico grupal.",
      "Repaso del último tema de la materia impartido en clase.",
      "Resolución de exámenes pasados y guías.",
      "Dudas conceptuales específicas y repaso general.",
      "Preparación del examen final y temas avanzados."
    ];
    const comentariosCalificacion = [
      "Excelente explicación, muy paciente y puntual.",
      "Explicó todo muy claro y me ayudó mucho.",
      "Muy buen tutor, domina el tema a la perfección.",
      "Buena tutoría, aunque fue un poco rápido.",
      "Explicación dinámica, llegamos a resolver toda la guía.",
      "Bastante atento y paciente al responder mis dudas."
    ];

    const citasCreadas: Cita[] = [];

    for (let c = 1; c <= 400; c++) {
      const estudiante = users[Math.floor(Math.random() * users.length)];
      // Buscar tutor que no sea el mismo estudiante
      const availableTutorsForEstudiante = tutors.filter(t => t.id !== estudiante.id);
      if (availableTutorsForEstudiante.length === 0) continue;

      const tutor = availableTutorsForEstudiante[Math.floor(Math.random() * availableTutorsForEstudiante.length)];
      const materia = tutor.materias[Math.floor(Math.random() * tutor.materias.length)];

      const estado = estadosCitas[Math.floor(Math.random() * estadosCitas.length)];
      const descripcion = descripcionesCitas[Math.floor(Math.random() * descripcionesCitas.length)];

      // Fecha aleatoria en los últimos 180 días
      const fechaCita = new Date();
      fechaCita.setDate(fechaCita.getDate() - Math.floor(Math.random() * 180));
      fechaCita.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 4) * 15, 0, 0);

      const duracionHoras = Math.random() < 0.7 ? 1 : 2; // 1 o 2 horas de duración
      const fechaFin = new Date(fechaCita.getTime() + duracionHoras * 60 * 60 * 1000);

      const cita = this.citaRepository.create({
        estudiante,
        tutor,
        materia,
        fechaHoraInicio: fechaCita,
        fechaHoraFin: fechaFin,
        estado,
        descripcion,
        latitud: (-16.5000 + (Math.random() - 0.5) * 0.1).toFixed(6), // Alrededor de una ciudad
        longitud: (-68.1500 + (Math.random() - 0.5) * 0.1).toFixed(6),
        codigoConfirmacion: null,
        calificacion: null,
        comentarioCalificacion: null,
      });

      if (estado === 'finalizada') {
        const calif = Number((Math.random() * 2 + 3).toFixed(1)); // Calificación entre 3 y 5
        cita.calificacion = calif;
        cita.comentarioCalificacion = comentariosCalificacion[Math.floor(Math.random() * comentariosCalificacion.length)];
        
        // Sumar horas al tutor e incrementar tutorías
        tutor.totalTutoriasRealizadas += 1;
        tutor.promedioCalificacion = Number(((tutor.promedioCalificacion * (tutor.totalTutoriasRealizadas - 1) + calif) / tutor.totalTutoriasRealizadas).toFixed(2));
        
        // Simular las transacciones
        // Cobro estudiante (debito)
        await this.registrarTransaccion(estudiante, duracionHoras, 'debito', `Cobro por tutoría finalizada (Cita #${c})`, fechaCita);
        // Pago tutor (credito)
        await this.registrarTransaccion(tutor, duracionHoras, 'credito', `Pago por tutoría finalizada (Cita #${c})`, fechaFin);
      } else if (estado === 'cancelada') {
        // Decidir quién canceló
        const esEstudianteCancela = Math.random() < 0.5;
        const cancelador = esEstudianteCancela ? estudiante : tutor;
        cancelador.promedioCalificacion = Math.max(0, Number((cancelador.promedioCalificacion - 0.5).toFixed(2)));
        
        // Registrar transacciones de cobro inicial y reembolso parcial/completo
        await this.registrarTransaccion(estudiante, duracionHoras, 'debito', `Cobro anticipado por tutoría (Cita #${c})`, fechaCita);
        
        const reembolsoPorcentaje = esEstudianteCancela ? 0.5 : 1.0;
        const reembolso = duracionHoras * reembolsoPorcentaje;
        await this.registrarTransaccion(
          estudiante, 
          reembolso, 
          'credito', 
          esEstudianteCancela 
            ? `Reembolso parcial del 50% por cancelación del estudiante (Cita #${c})` 
            : `Reembolso del 100% por cancelación del tutor (Cita #${c})`, 
          new Date(fechaCita.getTime() + 10 * 60 * 1000)
        );
      } else if (estado === 'aceptada') {
        // Cobro anticipado realizado
        await this.registrarTransaccion(estudiante, duracionHoras, 'debito', `Cobro anticipado por tutoría (Cita #${c})`, fechaCita);
      }

      const savedCita = await this.citaRepository.save(cita);
      citasCreadas.push(savedCita);
    }

    // Guardar los promedios e incrementos de calificación calculados para los tutores
    for (const t of tutors) {
      await this.userRepository.save(t);
    }

    console.log(`[Seeder] Creadas ${citasCreadas.length} citas históricas.`);
    console.log('[Seeder] Creando conversaciones y mensajes de chats (200 chats con mensajes)...');

    // 5. Crear chats y mensajes realistas
    const poolMensajesEstudiante = [
      "Hola, vi que dictas esta materia. ¿Tienes disponibilidad esta semana?",
      "Hola, ¿cómo estás? Quería consultar si podías ayudarme con la guía práctica.",
      "Hola! ¿Aceptas tutorías para este fin de semana?",
      "Perfecto, ya te envié la solicitud de cita con los detalles.",
      "Excelente, estaré puntual en el lugar pactado.",
      "Voy de camino, llego en unos 5 a 10 minutos.",
      "Muchas gracias por la explicación de hoy, me sirvió muchísimo!",
    ];

    const poolMensajesTutor = [
      "Hola! Sí, claro que sí. Enseño esa materia. ¿Qué temas necesitas ver?",
      "Hola! Todo bien por acá. Sí, tengo disponibilidad. ¿En qué temas tienes dudas?",
      "Por las tardes tengo libre a partir de las 3 PM. ¿Qué día te queda cómodo?",
      "Listo, ya vi la solicitud y acabo de aceptarla.",
      "Perfecto, nos vemos allí entonces. Lleva tus guías de estudio por favor.",
      "Dale, no te preocupes. Te espero.",
      "Con gusto! Estudiá los temas de hoy y nos vemos en la próxima sesión. Éxitos!",
    ];

    let convsCreadas = 0;
    for (let i = 0; i < 200; i++) {
      // Elegir un tutor y estudiante aleatorios
      const tutor = tutors[Math.floor(Math.random() * tutors.length)];
      const estudiante = users.filter(u => u.id !== tutor.id)[Math.floor(Math.random() * (users.length - 1))];
      if (!estudiante) continue;

      const materia = tutor.materias[Math.floor(Math.random() * tutor.materias.length)];

      const conversacion = this.conversacionRepository.create({
        tutor,
        estudiante,
        materia,
      });

      const savedConv = await this.conversacionRepository.save(conversacion);
      convsCreadas++;

      // Generar 4-8 mensajes para esta conversación
      const numMsgs = Math.floor(Math.random() * 5) + 4;
      const baseTime = new Date();
      baseTime.setDate(baseTime.getDate() - Math.floor(Math.random() * 30)); // Conversaciones del último mes

      for (let m = 0; m < numMsgs; m++) {
        const esEstudianteEmisor = m % 2 === 0;
        const emisor = esEstudianteEmisor ? estudiante : tutor;
        
        let detalleMensaje = '';
        if (esEstudianteEmisor) {
          detalleMensaje = poolMensajesEstudiante[Math.min(m, poolMensajesEstudiante.length - 1)];
        } else {
          detalleMensaje = poolMensajesTutor[Math.min(m, poolMensajesTutor.length - 1)];
        }

        const msgTime = new Date(baseTime.getTime() + m * 30 * 60 * 1000); // Espaciados por 30 min
        const mensaje = this.mensajeRepository.create({
          detalleMensaje,
          emisor,
          conversacion: savedConv,
          fechaEnvio: msgTime,
        });

        await this.mensajeRepository.save(mensaje);
      }
    }

    console.log(`[Seeder] Creadas ${convsCreadas} conversaciones de chat con su respectivo historial.`);
    console.log('[Seeder] Siembra completada con éxito.');
  }
}
