import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service'; // Importando o módulo vizinho
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, // Injetamos o serviço de usuários
    private jwtService: JwtService, // Injetamos o gerador de tokens
  ) {}
  // --- FUNÇÃO DE REGISTRO ---
  async register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // --- FUNÇÃO DE LOGIN ---
  async login(loginDto: LoginDto) {
    // 1. Busca o usuário pelo email
    const user = await this.usersService.findOneByEmail(loginDto.email);

    // 2. Se usuário não existe, rejeita imediatamente
    if (!user) {
      throw new UnauthorizedException(
        'Credenciais inválidas (Email não encontrado)',
      );
    }

    // 3. Comparação de Senhas (A Hora da Verdade)
    // bcrypt.compare(senha_digitada, hash_do_banco)
    // Ele pega a senha digitada, aplica o mesmo algoritmo e vê se o resultado bate com o hash.
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Credenciais inválidas (Senha incorreta)',
      );
    }

    // 4. Se passou, vamos gerar a "Pulseira" (Token)
    // O 'payload' é o conteúdo que vai ficar escrito dentro do token criptografado.
    const payload = { sub: user._id, email: user.email, name: user.name };

    return {
      access_token: await this.jwtService.signAsync(payload), // Assina o token digitalmente
      user: {
        // Retornamos dados básicos para o frontend saber quem logou
        name: user.name,
        email: user.email,
      },
    };
  }
}
