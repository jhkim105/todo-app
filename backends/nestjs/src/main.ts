import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  // Swagger / OpenAPI 설정
  const config = new DocumentBuilder()
    .setTitle('Todo App API - NestJS')
    .setDescription(
      'Todo 애플리케이션 REST API.\n\n' +
      '## Categories\n카테고리 CRUD 엔드포인트\n\n' +
      '## Tasks\n카테고리별 필터링 지원 Task CRUD 엔드포인트'
    )
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      displayRequestDuration: true,
      filter: true,
      deepLinking: true,
    },
  });

  console.log('⚡ Starting NestJS Backend on http://localhost:3333...');
  console.log('📄 Swagger UI: http://localhost:3333/docs');
  console.log('📄 OpenAPI JSON: http://localhost:3333/docs-json');
  await app.listen(3333);
}
bootstrap();
