import { Request, Response, Router } from 'express';
import { AppDataSource } from '../data-source';
import { Post } from '../entity/Posts';
import { addNotificationToQueue } from '../queue';
import { getIO } from '../socket-connection';

const router = Router();
const postRepo = AppDataSource.getRepository(Post);

router.post('/', async (req: Request, res: Response) => {
    try {
        const { socket_id, parent_id, content } = req.body;

        const post = new Post();
        post.socket_id = socket_id;
        post.content = content;

        post.parent = null;
        if (parent_id) {
            const parentPost = await postRepo.findOneBy({ id: parent_id });
            if (!parentPost) return res.status(404).json({ error: 'Parent post not found' });
            post.parent = parentPost;
            await addNotificationToQueue(post.parent.socket_id, "New reply to your post: "+post.parent.content);
            const io = getIO();
            // Emit notification to the parent post's user socket
            io.to(post.parent.socket_id).emit('notification', { content: post.parent.content })
        }
        const savedPost = await postRepo.save(post);
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json({ error: 'Error creating post', details: err });
    }
});

router.get('/', async (_req: Request, res: Response) => {
    try {
        const posts = await postRepo
            .createQueryBuilder('posts')
            .leftJoinAndSelect('posts.children', 'children')
            .where('posts.parent_id IS NULL')
            .orderBy('posts.created_at', 'DESC')
            .getMany();
        // console.log(posts);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching posts', message: err.message });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const post = await postRepo.findOne({
            where: { id: +req.params.id },
            relations: ['children']
        });

        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching post' });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const post = await postRepo.findOneBy({ id: +req.params.id });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        post.content = req.body.content || post.content;
        const updated = await postRepo.save(post);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Error updating post' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const result = await postRepo.delete(+req.params.id);
        if (result.affected === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting post' });
    }
});

export default router;
