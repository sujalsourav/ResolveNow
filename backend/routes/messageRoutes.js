import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);
router.get('/:complaintId', getMessages);
router.post('/:complaintId', sendMessage);

export default router;
