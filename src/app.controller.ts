import { Controller, Get, UseGuards, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';

// 1. Define the Security Guard
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Reject if there is no token, or if it matches our invalid test string
    if (!authHeader || authHeader === 'Bearer invalid.token.string') {
      throw new UnauthorizedException('Invalid or missing authentication token');
    }
    
    return true; // Token exists and is "valid", allow the request
  }
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 2. Apply the Guard to protect the route
  @UseGuards(AuthGuard)
  @Get('students')
  async getStudents() {
    // ⚠️ Note: Currently returning an empty array. 
    // To fully validate RLS, this will eventually need to query your database.
    return []; 
  }
}