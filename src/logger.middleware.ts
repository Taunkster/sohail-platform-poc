import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // Using the native NestJS Logger, but structuring the payload as JSON
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = crypto.randomUUID();
    const { method, originalUrl } = req;
    const startTime = Date.now();

    // Hook into the 'finish' event of the response to calculate duration
    res.on('finish', () => {
      const { statusCode } = res;
      const durationMs = Date.now() - startTime;
      
      // Extract the user payload attached by AuthGuard (if it passed)
      const user: any = (req as any).user || {};
      const tenantId = user.tenant_id || 'unauthenticated';
      const role = user.role || 'none';
      const sub = user.sub || 'anonymous';

      // The Structured Log Payload
      const logPayload = {
        correlationId,
        method,
        path: originalUrl,
        statusCode,
        durationMs,
        tenantId,
        role,
        sub,
      };

      // Determine Log Level based on status code
      if (statusCode >= 500) {
        this.logger.error(JSON.stringify(logPayload));
      } else if (statusCode >= 400) {
        // 401s and 403s are client errors, but we want a warning/error trace for security audits
        this.logger.warn(JSON.stringify(logPayload));
      } else {
        this.logger.log(JSON.stringify(logPayload));
      }
    });

    next();
  }
}