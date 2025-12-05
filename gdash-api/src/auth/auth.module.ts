import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    UsersModule, // We import this to be able to use UsersService

    // JWT Configuration
    JwtModule.register({
      global: true, // Available throughout the app
      secret: 'SEGREDO_SUPER_SECRETO_DO_GDASH', // In production, this would go in the .env!
      signOptions: { expiresIn: '1h' }, // The token expires in 1 hour (security)
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard, AuthService], // Exports AuthGuard and AuthService for other modules
})
export class AuthModule {}
