import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// Global polyfill for BigInt JSON serialization (Prisma maps bigint columns to JS BigInt)
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally - similar to Spring's @Valid
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost:8000',
      'http://localhost:5000',
      'http://localhost:3333'
    ],
    credentials: true,
  });

  console.log('⚡ Starting NestJS Backend on http://localhost:3333...');
  await app.listen(3333);
}
bootstrap();
