import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { urlencoded } from 'express';

async function startApp() {
  const PORT = process.env.APP_PORT || 5555;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ credentials: true, origin: true });
  app.use(
    urlencoded({
      limit: '200mb',
      extended: true,
      parameterLimit: 50000,
    }),
  );

  await app.listen(PORT, () => console.log(`App started on port: ${PORT}`));
}

startApp();
