import Expense from '../models/expenseModel.js';
import User from '../models/userModel.js';

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res) => {
  try {
    const { title, description, amount, participants } = req.body;
    
    // Validate participants
    if (!participants || participants.length === 0) {
      return res.status(400).json({ message: 'At least one participant is required' });
    }
    
    // Calculate individual share
    const individualShare = amount / (participants.length + 1); // +1 for the creator
    
    // Create participant payment objects
    const participantPayments = await Promise.all(
      participants.map(async (participantId) => {
        const user = await User.findById(participantId);
        if (!user) {
          throw new Error(`User with ID ${participantId} not found`);
        }
        
        return {
          user: participantId,
          amount: individualShare,
          paid: false
        };
      })
    );
    
    // Create expense
    const expense = await Expense.create({
      title,
      description,
      amount,
      creator: req.user._id,
      participants: participantPayments
    });
    
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    // Find expenses where user is creator
    const createdExpenses = await Expense.find({ creator: req.user._id })
      .populate('creator', 'name email')
      .populate('participants.user', 'name email');
    
    // Find expenses where user is a participant
    const participatedExpenses = await Expense.find({
      'participants.user': req.user._id
    })
      .populate('creator', 'name email')
      .populate('participants.user', 'name email');
    
    res.json({
      created: createdExpenses,
      participated: participatedExpenses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('participants.user', 'name email');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check if user is creator or participant
    const isCreator = expense.creator._id.toString() === req.user._id.toString();
    const isParticipant = expense.participants.some(
      p => p.user._id.toString() === req.user._id.toString()
    );
    
    if (!isCreator && !isParticipant) {
      return res.status(403).json({ message: 'Not authorized to access this expense' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payment status
// @route   PUT /api/expenses/:id/pay
// @access  Private
export const updatePaymentStatus = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Find the participant
    const participant = expense.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );
    
    if (!participant) {
      return res.status(400).json({ message: 'You are not a participant in this expense' });
    }
    
    // Update payment status
    participant.paid = true;
    participant.paidAt = Date.now();
    
    // Check if all participants have paid
    const allPaid = expense.participants.every(p => p.paid);
    if (allPaid) {
      expense.settled = true;
    }
    
    await expense.save();
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send payment reminder
// @route   POST /api/expenses/:id/remind/:userId
// @access  Private
export const sendPaymentReminder = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check if user is the creator
    if (expense.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can send reminders' });
    }
    
    // Find the participant to remind
    const participant = expense.participants.find(
      p => p.user.toString() === req.params.userId
    );
    
    if (!participant) {
      return res.status(400).json({ message: 'User is not a participant in this expense' });
    }
    
    if (participant.paid) {
      return res.status(400).json({ message: 'This user has already paid' });
    }
    
    // Update reminder status
    participant.reminderSent = true;
    participant.lastReminderSent = Date.now();
    
    await expense.save();
    
    // In a real app, you would send an email or notification here
    
    res.json({ message: 'Reminder sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};