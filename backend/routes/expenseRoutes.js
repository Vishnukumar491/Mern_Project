import express from 'express';
import { 
  createExpense, 
  getExpenses, 
  getExpenseById, 
  updatePaymentStatus, 
  sendPaymentReminder 
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createExpense)
  .get(protect, getExpenses);

router.route('/:id')
  .get(protect, getExpenseById);

router.route('/:id/pay')
  .put(protect, updatePaymentStatus);

router.route('/:id/remind/:userId')
  .post(protect, sendPaymentReminder);

export default router;