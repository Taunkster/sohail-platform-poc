import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Sohail Platform Security Matrix (e2e)', () => {
  let app: INestApplication;

  // The Test Matrix Identities
  const adminA = 'Bearer admin-tenant-a';
  const studentA = 'Bearer student-tenant-a';
  const adminB = 'Bearer admin-tenant-b';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Vertical Security (RBAC)', () => {
    it('Admin can POST /students (201)', () => {
      return request(app.getHttpServer())
        .post('/students')
        .set('Authorization', adminA)
        .expect(201);
    });

    it('Admin can POST /tasks (201)', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', adminA)
        .expect(201);
    });

    it('Student CANNOT POST /tasks (403)', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', studentA)
        .expect(403); // The negative test assertion
    });

    it('Student GET /tasks returns scoped payload', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', studentA)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Assigned tasks only');
        });
    });
  });

  describe('Horizontal Security (RLS)', () => {
    it('Tenant A identity accesses Tenant A data', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', adminA)
        .expect(200)
        .expect((res) => {
          expect(res.body.tenant).toEqual('tenant_a');
        });
    });

    it('Tenant B identity NEVER accesses Tenant A data', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', adminB)
        .expect(200)
        .expect((res) => {
          expect(res.body.tenant).toEqual('tenant_b'); // Proves context shifted safely
          expect(res.body.tenant).not.toEqual('tenant_a');
        });
    });
  });
});