import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, verifyEmail, updateProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').trim().toLowerCase().isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register
);

router.post('/verify-email', verifyEmail);

router.post(
  '/login',
  [
    body('email').trim().toLowerCase().isEmail(),
    body('password').notEmpty(),
  ],
  login
);

router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

export default router;
