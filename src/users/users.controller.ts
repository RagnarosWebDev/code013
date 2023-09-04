import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }
}
