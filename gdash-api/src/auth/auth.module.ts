import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module'; // Importante!
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    UsersModule, // Importamos para poder usar o UsersService

    // Configuração do JWT
    JwtModule.register({
      global: true, // Disponível no app todo
      secret: 'SEGREDO_SUPER_SECRETO_DO_GDASH', // Em produção, isso iria no .env!
      signOptions: { expiresIn: '1h' }, // O token expira em 1 hora (segurança)
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard, AuthService], // Exporta o AuthGuard e AuthService para outros módulos
})
export class AuthModule {}
