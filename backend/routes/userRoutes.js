import express from 'express';
import { body } from 'express-validator';
import { getAgents, createAgent, getStats, getAllUsers } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/all', getAllUsers);
router.get('/agents', getAgents);
router.post(
  '/agents',
  [
    body('fullName').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  createAgent
);
router.get('/stats', getStats);

export default router;
