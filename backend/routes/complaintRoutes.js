import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  submitFeedback,
  listComplaints,
  submitSuggestion,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.use(protect);

router.post('/', upload.array('attachments', 5), createComplaint);
router.get('/my', getMyComplaints);
router.get('/list', authorize('admin', 'agent'), listComplaints);
router.get('/:id', getComplaintById);
router.put('/:id/status', authorize('agent', 'admin'), updateComplaintStatus);
router.put('/:id/assign', authorize('admin'), assignComplaint);
router.post('/:id/feedback', submitFeedback);
router.post('/:id/suggestion', submitSuggestion);

export default router;
