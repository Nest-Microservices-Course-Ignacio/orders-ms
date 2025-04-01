import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envVars } from './config/envs';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: envVars.PORT,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen();

  Logger.log(
    `Microservice is listening on port ${envVars.PORT}`,
    'Orders Main',
  );
}
bootstrap();
