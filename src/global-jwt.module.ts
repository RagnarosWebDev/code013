import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('PRIVATE_KEY'),
        signOptions: {},
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [JwtModule],
})
export class GlobalJwtModule {}
