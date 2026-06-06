import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MensajesService } from './mensajes.service';
import { MensajesController } from './mensajes.controller';
import { MensajesGateway } from './mensajes.gateway';
import { Mensaje } from './entities/mensaje.entity';
import { Conversacion } from './entities/conversacion.entity';
import { User } from '../user/entities/user.entity';
import { Materia } from '../materia/entities/materia.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mensaje, Conversacion, User, Materia]),
    AuthModule,
    UserModule,
  ],
  controllers: [MensajesController],
  providers: [MensajesService, MensajesGateway],
  exports: [MensajesService, MensajesGateway],
})
export class MensajesModule {}
