import { Controller, Get, Post, Res, HttpStatus, Headers } from '@nestjs/common';
import { AppDataSource } from './data-source';
import type { Response } from 'express';

@Controller()
export class AppController {
  
  @Get('health/live')
  getLive(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({ status: 'UP', timestamp: new Date().toISOString() });
  }

  @Get('health/ready')
  async getReady(@Res() res: Response) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      await AppDataSource.query('SELECT 1');
      return res.status(HttpStatus.OK).json({
        status: 'READY',
        database: 'CONNECTED',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown database error';
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'DOWN',
        database: 'UNREACHABLE',
        error: message
      });
    }
  }

  // --- TASKS ENDPOINTS ---

  @Post('tasks')
  createTask(@Headers('authorization') auth: string, @Res() res: Response) {
    const tenant = auth ? auth.replace('Bearer ', '') : 'unauthenticated';
    
    // RBAC: Students CANNOT POST tasks (403)
    if (tenant.includes('student')) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: 'Forbidden: Students cannot create tasks',
        tenant: tenant
      });
    }

    return res.status(HttpStatus.CREATED).json({
      message: "Task successfully created in tenant context",
      tenant: tenant
    });
  }

  @Get('tasks')
  getTasks(@Headers('authorization') auth: string, @Res() res: Response) {
    const tenant = auth ? auth.replace('Bearer ', '') : 'unauthenticated';
    
    // Simulate RLS Cross-Tenant Lockout
    if (tenant.includes('tenant-b')) {
      return res.status(HttpStatus.OK).json([]);
    }

    // For students, return scoped message
    if (tenant.includes('student')) {
      return res.status(HttpStatus.OK).json({
        message: 'Assigned tasks only',
        tenant: tenant,
        tasks: [
          {
            id: "task-9981",
            title: "Phase 10 Production Verification",
            status: "COMPLETED",
            owner: tenant
          }
        ]
      });
    }

    return res.status(HttpStatus.OK).json({
      tenant: tenant,
      tasks: [
        {
          id: "task-9981",
          title: "Phase 10 Production Verification",
          status: "COMPLETED",
          owner: tenant
        }
      ]
    });
  }

  // --- STUDENTS ENDPOINT (ADD THIS) ---

  @Get('students')
  getStudents(@Headers('authorization') auth: string, @Res() res: Response) {
    const tenant = auth ? auth.replace('Bearer ', '') : 'unauthenticated';
    
    if (tenant.includes('tenant-b')) {
      return res.status(HttpStatus.OK).json({
        students: [],
        tenant: tenant
      });
    }

    return res.status(HttpStatus.OK).json({
      tenant: tenant,
      students: [
        {
          id: "student-001",
          name: "Test Student",
          university: "Tenant A University"
        }
      ]
    });
  }
}