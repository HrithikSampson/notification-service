import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeParentIdNullable1752315739747 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE posts
            ALTER COLUMN parent_id DROP NOT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE posts
            ALTER COLUMN parent_id SET NOT NULL;
        `);
    }

}
