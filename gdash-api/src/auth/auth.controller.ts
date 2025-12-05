import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK) // Retorna 200 OK em vez de 201 Created
  @Post('login') // URL Final: POST /auth/login
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register') // URL: POST /auth/register
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
