import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { CustomRequest } from 'src/shared/interfaces';

@Injectable()
export class RefreshTokenInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    try {
      const user = request.user;
      if (user) {
        const refreshToken = this.jwtService.sign(
          { userId: user.id },
          { expiresIn: '7d' },
        );
        response.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        });
      }
    } catch (error) {
      console.error('Error setting refresh token cookie:', error);
    }
    return next.handle();
  }
}
