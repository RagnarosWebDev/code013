import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(private jwtService: JwtService) {}
  async login({ login, password }: LoginDto) {
    if (login != 'admin' || password !== 'admin')
      throw new BadRequestException('Вход неудачен');
    return {
      token: this.jwtService.sign({
        login: login,
        date: new Date().getTime(),
      }),
    };
  }
}
