import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { typeOrmConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { IsJsonValidMiddleware } from './middleware/is-json-valid.middleware';
import { AuthModule } from './auth/auth.module';
import { EspecialidadModule } from './especialidad/especialidad.module';
import { MateriaModule } from './materia/materia.module';
import { CitaModule } from './cita/cita.module';
import { MensajesModule } from './mensajes/mensajes.module';

import { User } from './user/entities/user.entity';
import { Transaccion } from './user/entities/transaccion.entity';
import { Cita } from './cita/entities/cita.entity';
import { Materia } from './materia/entities/materia.entity';
import { Especialidad } from './especialidad/entities/especialidad.entity';
import { Conversacion } from './mensajes/entities/conversacion.entity';
import { Mensaje } from './mensajes/entities/mensaje.entity';
import { SeederService } from './common/seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([User, Transaccion, Cita, Materia, Especialidad, Conversacion, Mensaje]),
    UserModule,
    AuthModule,
    EspecialidadModule,
    MateriaModule,
    CitaModule,
    MensajesModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IsJsonValidMiddleware).forRoutes({
      path: 'user',
      method: RequestMethod.POST,
    });
  }
}
