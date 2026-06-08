import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMultiTenantSchema1717850000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE universities (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                tenant_identifier VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE students (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                university_id UUID NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_university FOREIGN KEY (university_id) 
                    REFERENCES universities(id) ON DELETE CASCADE
            );

            CREATE TABLE tasks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                student_id UUID NOT NULL,
                university_id UUID NOT NULL,
                title VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_task_student FOREIGN KEY (student_id) 
                    REFERENCES students(id) ON DELETE CASCADE,
                CONSTRAINT fk_task_university FOREIGN KEY (university_id) 
                    REFERENCES universities(id) ON DELETE CASCADE
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE tasks`);
        await queryRunner.query(`DROP TABLE students`);
        await queryRunner.query(`DROP TABLE universities`);
    }
}
