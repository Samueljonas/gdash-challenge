import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  // Este método roda ANTES de qualquer controller
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Extrai o token do cabeçalho "Authorization: Bearer <token>"
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token não encontrado! Faça login.');
    }

    try {
      // 2. Verifica se o token é válido e não expirou
      // O segredo deve ser o mesmo usado no auth.module.ts
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'SEGREDO_SUPER_SECRETO_DO_GDASH',
      });

      // 3. Pendura os dados do usuário no objeto da requisição
      // Assim, podemos saber QUEM está acessando lá no Controller
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    return true; // Deixa passar
  }

  // Função auxiliar para pegar o texto depois da palavra "Bearer"
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
