import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader: string = req.headers.authorization;
    if (!authHeader) {
      throw new ForbiddenException('Токена нет в заголовке');
    }
    const [bearer, token] = authHeader.split(' ');
    if (bearer.toLowerCase() !== 'bearer' || !token) {
      throw new ForbiddenException('Токена неверного формата');
    }
    try {
      this.jwtService.verify<any>(token);
      return true;
    } catch (e) {
      return false;
    }
  }
}
