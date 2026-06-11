import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { tap, catchError, finalize } from 'rxjs/operators';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private dataSource: DataSource) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenant_id;

    if (!tenantId) return next.handle();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(`SET LOCAL app.current_tenant = '${tenantId}'`);
      request.queryRunner = queryRunner;

      return next.handle().pipe(
        tap(async () => { await queryRunner.commitTransaction(); }),
        catchError(async (err) => {
          await queryRunner.rollbackTransaction();
          throw err;
        }),
        finalize(async () => { await queryRunner.release(); })
      );
    } catch (err) {
      await queryRunner.release();
      throw err;
    }
  }
}
