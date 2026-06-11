import { Controller, Get, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TenantContextInterceptor } from './tenant-context.interceptor';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TenantContextInterceptor)
  @Get()
  async getStudents(@Req() req: Request & { queryRunner: any }) {
    // Passes the secured transaction context to the database
    return this.studentsService.findAll(req.queryRunner);
  }
}
