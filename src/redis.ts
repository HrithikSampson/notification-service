
import { createClient } from 'redis';
import { RedisOptions } from 'bullmq';
import dotenv from "dotenv";
dotenv.config();
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisPort = parseInt(process.env.REDIS_PORT) || 6379;
export const pubClient = createClient({ url: `${redisUrl}:${redisPort}` });
export const subClient = pubClient.duplicate();

export const bullmqConnection = {
  host: 'localhost',
  port: redisPort,
} satisfies RedisOptions;

(async function () {
    await pubClient.connect();
    await subClient.connect();
})();