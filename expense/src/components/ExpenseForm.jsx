import { useState, useEffect } from 'react';
import { getFriends, createExpense } from '../services/api';
import './ExpenseForm.css';

const ExpenseForm = ({ user, onExpenseAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const data = await getFriends(user.token);
        setFriends(data);
      } catch (error) {
        setError('Failed to load friends');
        console.error(error);
      }
    };

    loadFriends();
  }, [user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !amount || selectedFriends.length === 0) {
      setError('Please fill all required fields and select at least one friend');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const expenseData = {
        title,
        description,
        amount: parseFloat(amount),
        participants: selectedFriends
      };

      await createExpense(expenseData, user.token);
      
      // Reset form
      setTitle('');
      setDescription('');
      setAmount('');
      setSelectedFriends([]);
      setSuccess('Expense created successfully!');
      
      // Notify parent component
      if (onExpenseAdded) {
        onExpenseAdded();
      }
    } catch (error) {
      setError('Failed to create expense');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  return (
    <div className="expense-form-container">
      <h2 className="form-title">Create New Expense</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Dinner at Restaurant"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details about this expense"
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Amount ($) *</label>
          <input
            type="number"
            id="amount"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Split with *</label>
          {friends.length === 0 ? (
            <p className="no-friends-message">
              You haven't added any friends yet. Add friends to split expenses.
            </p>
          ) : (
            <div className="friends-list">
              {friends.map((friend) => (
                <div key={friend._id} className="friend-item">
                  <input
                    type="checkbox"
                    id={`friend-${friend._id}`}
                    checked={selectedFriends.includes(friend._id)}
                    onChange={() => toggleFriendSelection(friend._id)}
                  />
                  <label htmlFor={`friend-${friend._id}`} className="friend-label">
                    {friend.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary submit-button" 
          disabled={loading || friends.length === 0}
        >
          {loading ? 'Creating...' : 'Create Expense'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;