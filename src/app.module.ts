import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [], // <-- Make sure this is empty or only has your DB connections
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}