import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // --- Swagger / OpenAPI configuration ---
  const config = new DocumentBuilder()
    .setTitle('Sohail Platform API')
    .setDescription('Multi‑tenant student task management with RLS and RBAC.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token (e.g. `admin-tenant-a` or `student-tenant-a`)',
      },
      'JWT-auth', // This name is used in @ApiBearerAuth() decorators
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keep the token when refreshing
    },
  });

  // --- Existing shutdown hooks and port ---
  app.enableShutdownHooks();
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Sohail Platform Engine serving on port ${port}`);
  logger.log(`📚 Swagger docs available at /api-docs`);
}
bootstrap();