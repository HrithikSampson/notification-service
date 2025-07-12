import { Request, Response, Router } from 'express';
import { Queue } from 'bullmq';
import { AppDataSource } from '../data-source';
import { Notification } from '../entity/Notification';
import { bullmqConnection } from '../redis';

const router = Router();
const notificationQueue = new Queue('notification-queue', {
  connection: bullmqConnection,
});

export const getNotifications = async (req: Request, res: Response) => {
  const socketId = req.header('x-socket-id');
  if (!socketId) return res.status(400).json({ error: 'Missing X-Socket-Id header' });

  const notifRepo = AppDataSource.getRepository(Notification);

  const savedNotifications = await notifRepo.find({
    where: { socket_id: socketId },
    order: { created_at: 'DESC' },
  });

  const [waiting, active, delayed] = await Promise.all([
    notificationQueue.getWaiting(),
    notificationQueue.getActive(),
    notificationQueue.getDelayed(),
  ]);
  const allPendingJobs = [...waiting, ...active, ...delayed];

  const pendingNotifications = allPendingJobs
    .map((job) => job.data)
    .filter((job) => job.socket_id === socketId);


  console.log(`Pending notifications for socket ${socketId}:`, pendingNotifications);
  console.log(`Saved notifications for socket ${socketId}:`, savedNotifications);
  return res.status(200).json({
    saved: savedNotifications,
    pending: pendingNotifications,
  });
};

router.get('/', getNotifications);

export default router;