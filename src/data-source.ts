import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  entities: [
    process.env.NODE_ENV === 'production' 
      ? 'dist/**/*.entity.js' 
      : 'src/**/*.entity.ts'
  ],
  migrations: [
    process.env.NODE_ENV === 'production' 
      ? 'dist/src/migrations/*.js' 
      : 'src/migrations/*.ts'
  ],
  synchronize: false,
});