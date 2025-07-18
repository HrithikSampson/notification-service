import { Queue, Worker } from 'bullmq';
import { bullmqConnection } from './redis';
import { Notification } from './entity/Notification';
import { AppDataSource } from './data-source';
import os from 'os';

export const notificationQueue = new Queue('notification-queue', {
  connection: bullmqConnection,
});

export const addNotificationToQueue = async (socket_id: string, content: string) => {
  const job = await notificationQueue.add('send-notification', { socket_id, content },{
    attempts: 5,
    backoff: {
        type: 'exponential',
        delay: 3000
    },
    removeOnComplete: true,
    removeOnFail: false
  });
  console.log(`Notification added to queue for socket ${socket_id}: ${job.id}`);
}

export const notificationWorker = new Worker(
  'notification-queue',
  async (job) => {
    const { socket_id, content } = job.data;
    const notification = new Notification();
    notification.socket_id = socket_id;
    notification.content = content;

    if (!AppDataSource.isInitialized) {
      console.error('AppDataSource is not initialized! Initializing now...');
      await AppDataSource.initialize();
      console.log('AppDataSource initialized in worker.');
    } else {
      console.log('AppDataSource is initialized.');
    }

    const repo = AppDataSource.getRepository(Notification);
    try {
      await repo.save(notification);
      console.log(`Saved notification to DB for socket ${socket_id}`);
    } catch (error) {
      console.error(`Error saving notification for socket ${socket_id}:`, error);
    }
  },
  { 
    concurrency: os.cpus().length,
    connection: bullmqConnection
  }
);

notificationWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err}`);
});