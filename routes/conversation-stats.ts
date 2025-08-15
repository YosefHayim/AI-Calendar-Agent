import express from 'express';
import { conversationController } from '@/controllers/conversations-stats-controller';

const router = express.Router();

router.get('/:id', conversationController.getConversationById);

router.post('/', conversationController.createConversationBy);

router.patch('/:id', conversationController.updateConversationById);

router.delete('/:id', conversationController.deleteConversationById);

export default router;
