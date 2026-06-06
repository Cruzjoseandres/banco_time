export class UserInfoDto {
  id: number;
  username: string;
  fullName: string;
  role: string;
  saldoHoras: number;
  totalTutoriasRealizadas: number;
  promedioCalificacion: number;
  imagenPerfil: string;
  telefono: string;
  especialidades: { id: number; detalleEspecialidad: string }[];
  materias: { id: number; detalleMateria: string }[];
}
