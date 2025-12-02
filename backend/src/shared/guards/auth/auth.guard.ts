import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { CustomRequest } from 'src/shared/interfaces';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      // Intentar usar refresh token si no hay auth token
      return this.validateWithRefreshToken(request);
    }

    try {
      this.jwtService.verify(token);
      const payload = this.jwtService.decode<Record<string, string>>(token);
      request.user = payload;
      return true;
    } catch (error) {
      // Si el token expiró, intentar refrescar
      if ((error as Error).name === 'TokenExpiredError') {
        return this.validateWithRefreshToken(request);
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private validateWithRefreshToken(request: CustomRequest): boolean {
    const refreshToken = request.cookies['refreshToken'] as string;
    if (!refreshToken) {
      throw new UnauthorizedException('No token or refresh token provided');
    }

    try {
      this.jwtService.verify(refreshToken);
      const payload =
        this.jwtService.decode<Record<string, string>>(refreshToken);

      // Aquí deberías hacer una llamada a AuthService para generar un nuevo auth token
      // Por ahora, usamos el payload del refresh token
      request.user = payload;

      // Opcional: Generar y enviar un nuevo auth token al cliente
      // const newAuthToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      // response.setHeader('X-New-Auth-Token', newAuthToken);

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return null;
    }
    const [, token] = authHeader.split(' ');
    return token || null;
  }
}
