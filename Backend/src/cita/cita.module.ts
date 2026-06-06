import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitaService } from './cita.service';
import { CitaController } from './cita.controller';
import { Cita } from './entities/cita.entity';
import { User } from '../user/entities/user.entity';
import { Transaccion } from '../user/entities/transaccion.entity';
import { Materia } from '../materia/entities/materia.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { MensajesModule } from '../mensajes/mensajes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cita, User, Transaccion, Materia]),
    AuthModule,
    UserModule,
    MensajesModule,
  ],
  controllers: [CitaController],
  providers: [CitaService],
  exports: [CitaService],
})
export class CitaModule {}
