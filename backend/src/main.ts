/* eslint-disable @typescript-eslint/no-floating-promises */
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle(' Car Rental API')
    .setDescription('API documentation for the car rental system')
    .setVersion('1.0')
    .addBearerAuth() // Adds JWT bearer token auth
    .build();

  app.enableCors({
    origin: 'http://localhost:4200',
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
