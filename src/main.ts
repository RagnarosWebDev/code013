import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function startApp() {
  const PORT = process.env.APP_PORT || 5555;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ credentials: true, origin: true });

  await app.listen(PORT, () => console.log(`App started on port: ${PORT}`));
}

startApp();
