import 'dotenv/config';
import "reflect-metadata"
import { DataSource } from "typeorm"
import { Post } from "./entity/Posts"
import { Notification } from "./entity/Notification"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
    username: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE_NAME,
    synchronize: false,
    logging: false,
    entities: [Post, Notification],
    migrations: ['src/migration/**/*.ts'],
    subscribers: [],
})
