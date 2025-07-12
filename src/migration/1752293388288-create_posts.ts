import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePosts1752293388288 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                socket_id UUID NOT NULL,
                parent_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE posts;`);
    }

}
