import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // ADD THIS

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  // --- SWAGGER CONFIGURATION ---
  const config = new DocumentBuilder()
    .setTitle('Sohail Platform API')
    .setDescription('Multi-tenant data layer for student management')
    .setVersion('1.0')
    .addBearerAuth() // Tells Swagger this API uses Bearer tokens
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); 
  // Docs will be available at /api-docs

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Sohail Platform Engine serving traffic on port ${port}`);
  logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api-docs`);
}
bootstrap();