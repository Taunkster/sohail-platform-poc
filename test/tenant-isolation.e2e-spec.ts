import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest'; // <-- This is the fixed import
import { AppModule } from './../src/app.module';

describe('Multi-Tenant RLS Security (e2e)', () => {
  let app: INestApplication;
  
  let tenantAToken: string; 
  let tenantBToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    tenantAToken = process.env.TEST_TOKEN_TENANT_A || 'aurak_valid_token';
    tenantBToken = process.env.TEST_TOKEN_TENANT_B || 'rit_valid_token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /students (RLS Database Enforcement)', () => {
    
    it('should return ONLY Tenant A students when authenticated as Tenant A', async () => {
      const response = await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${tenantAToken}`)
        .expect(200);

      const students = response.body;
      
      students.forEach(student => {
        expect(student.tenant_id).toEqual('tenant-a-uuid');
        expect(student.tenant_id).not.toEqual('tenant-b-uuid');
      });
    });

    it('should return ONLY Tenant B students when authenticated as Tenant B', async () => {
      const response = await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${tenantBToken}`)
        .expect(200);

      const students = response.body;

      students.forEach(student => {
        expect(student.tenant_id).toEqual('tenant-b-uuid');
        expect(student.tenant_id).not.toEqual('tenant-a-uuid');
      });
    });

    it('should reject requests with missing authentication tokens (401)', async () => {
      await request(app.getHttpServer())
        .get('/students')
        .expect(401);
    });

    it('should reject requests with invalid or tampered tokens (401)', async () => {
      await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer invalid.token.string`)
        .expect(401);
    });
  });
});