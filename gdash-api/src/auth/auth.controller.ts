import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK) // Returns 200 OK instead of 201 Created
  @Post('login') // Final URL: POST /auth/login
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register') // URL: POST /auth/register
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
