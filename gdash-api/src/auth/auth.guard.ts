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

  // This method runs BEFORE any controller
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Extracts the token from the "Authorization: Bearer <token>" header
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found! Please log in.');
    }

    try {
      // 2. Verifies if the token is valid and has not expired
      // The secret must be the same as the one used in auth.module.ts
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'SEGREDO_SUPER_SECRETO_DO_GDASH',
      });

      // 3. Attaches the user data to the request object
      // This way, we can know WHO is accessing it in the Controller
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    return true; // Let it pass
  }

  // Helper function to get the text after the word "Bearer"
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
