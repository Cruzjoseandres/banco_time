import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { Transaccion } from './entities/transaccion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from '../auth/admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Especialidad, Transaccion]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService, AdminGuard],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
