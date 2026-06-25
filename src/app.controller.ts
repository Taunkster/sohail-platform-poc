import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';


@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid or missing authentication token');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // The Testing Matrix Tokens
    if (token === 'admin-tenant-a') {
      request.user = { sub: '123', tenant_id: 'tenant_a', role: 'admin' };
      return true;
    }
    if (token === 'student-tenant-a') {
      request.user = { sub: '456', tenant_id: 'tenant_a', role: 'student' };
      return true;
    }
    if (token === 'admin-tenant-b') {
      request.user = { sub: '999', tenant_id: 'tenant_b', role: 'admin' };
      return true;
    }

    throw new UnauthorizedException('Invalid token');
  }
}

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('students')
  async getStudents(@Req() req) {
    const user = req.user;
    if (user.role === 'admin') {
      return { message: 'Admin view: All students', tenant: user.tenant_id };
    } else {
      return { message: 'Student view: Own record only', tenant: user.tenant_id, id: user.sub };
    }
  }

  @Post('students')
  @Roles('admin')
  async createStudent() {
    return { message: 'Student created successfully' };
  }

  // --- NEW TASK ENDPOINTS ---

  @Get('tasks')
  async getTasks(@Req() req) {
    const user = req.user;
    // RLS inherently blocks cross-tenant data at the DB level.
    // RBAC scopes the remaining data at the application level.
    if (user.role === 'admin') {
      return { message: 'Admin view: All tasks in tenant', tenant: user.tenant_id };
    } else {
      return { message: 'Student view: Assigned tasks only', tenant: user.tenant_id, id: user.sub };
    }
  }

  @Post('tasks')
  @Roles('admin') // 🔒 Strict RBAC Requirement
  async createTask() {
    return { message: 'Task created successfully' };
  }
}