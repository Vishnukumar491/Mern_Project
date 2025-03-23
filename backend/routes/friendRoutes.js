import express from 'express';
import { addFriend, getFriends, removeFriend } from '../controllers/friendController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addFriend)
  .get(protect, getFriends);

router.route('/:id')
  .delete(protect, removeFriend);

export default router;