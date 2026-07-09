import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { AppDataSource } from './data-source';
import type { Response } from 'express';

@Controller('health')
export class AppController {
  
  @Get('live')
  getLive(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({ status: 'UP', timestamp: new Date().toISOString() });
  }

  @Get('ready')
  async getReady(@Res() res: Response) {
    try {
      // Connect the driver if it isn't already connected!
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      
      await AppDataSource.query('SELECT 1');
      
      return res.status(HttpStatus.OK).json({
        status: 'READY',
        database: 'CONNECTED',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'DOWN',
        database: 'UNREACHABLE',
        error: error.message
      });
    }
  }
}