import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // --- CRITICAL OPERATIONAL HARDENING ---
  // Tells NestJS to listen for termination signals (SIGTERM, SIGINT)
  // and drain connection pools, finish in-flight requests, and exit safely.
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Sohail Platform Engine serving traffic on port ${port}`);
}
bootstrap();