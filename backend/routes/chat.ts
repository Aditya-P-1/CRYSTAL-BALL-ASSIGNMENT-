import { Router } from 'express';
import { handleChat } from '../controllers/chatController';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', rateLimiter, handleChat);

export default router;
