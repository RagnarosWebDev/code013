import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { GlobalJwtModule } from '../global-jwt.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [GlobalJwtModule],
})
export class UsersModule {}
