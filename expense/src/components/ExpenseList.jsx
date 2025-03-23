import { useState, useEffect } from 'react';
import { getExpenses, updatePaymentStatus, sendPaymentReminder } from '../services/api';
import './ExpenseList.css';

const ExpenseList = ({ user, refreshTrigger }) => {
  const [expenses, setExpenses] = useState({ created: [], participated: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('created');

  useEffect(() => {
    loadExpenses();
  }, [user.token, refreshTrigger]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await getExpenses(user.token);
      setExpenses(data);
    } catch (error) {
      setError('Failed to load expenses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayExpense = async (expenseId) => {
    try {
      await updatePaymentStatus(expenseId, user.token);
      loadExpenses();
    } catch (error) {
      setError('Failed to update payment status');
      console.error(error);
    }
  };

  const handleSendReminder = async (expenseId, userId) => {
    try {
      await sendPaymentReminder(expenseId, userId, user.token);
      alert('Reminder sent successfully!');
    } catch (error) {
      setError('Failed to send reminder');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateShare = (expense, participantId) => {
    const totalParticipants = expense.participants.length + 1; // +1 for creator
    return expense.amount / totalParticipants;
  };

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
  }

  const renderCreatedExpenses = () => {
    if (expenses.created.length === 0) {
      return <p className="no-expenses-message">You haven't created any expenses yet.</p>;
    }

    return expenses.created.map((expense) => (
      <div key={expense._id} className="expense-card">
        <div className="expense-header">
          <h3 className="expense-title">{expense.title}</h3>
          <span className={`expense-status ${expense.settled ? 'settled' : 'pending'}`}>
            {expense.settled ? 'Settled' : 'Pending'}
          </span>
        </div>
        
        {expense.description && (
          <p className="expense-description">{expense.description}</p>
        )}
        
        <div className="expense-details">
          <div className="expense-amount">
            <span className="label">Total Amount:</span>
            <span className="value">${expense.amount.toFixed(2)}</span>
          </div>
          <div className="expense-date">
            <span className="label">Date:</span>
            <span className="value">{formatDate(expense.date)}</span>
          </div>
        </div>
        
        <div className="expense-participants">
          <h4>Participants</h4>
          <ul className="participants-list">
            {expense.participants.map((participant) => (
              <li key={participant._id} className="participant-item">
                <div className="participant-info">
                  <span className="participant-name">{participant.user.name}</span>
                  <span className="participant-amount">${calculateShare(expense, participant.user._id).toFixed(2)}</span>
                </div>
                <div className="participant-status">
                  {participant.paid ? (
                    <span className="paid-status">Paid</span>
                  ) : (
                    <button 
                      className="btn btn-warning remind-button"
                      onClick={() => handleSendReminder(expense._id, participant.user._id)}
                    >
                      Send Reminder
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ));
  };

  const renderParticipatedExpenses = () => {
    if (expenses.participated.length === 0) {
      return <p className="no-expenses-message">You haven't been added to any expenses yet.</p>;
    }

    return expenses.participated.map((expense) => {
      const myParticipation = expense.participants.find(
        p => p.user._id === user._id
      );
      
      return (
        <div key={expense._id} className="expense-card">
          <div className="expense-header">
            <h3 className="expense-title">{expense.title}</h3>
            <span className={`expense-status ${myParticipation.paid ? 'settled' : 'pending'}`}>
              {myParticipation.paid ? 'Paid' : 'Pending'}
            </span>
          </div>
          
          {expense.description && (
            <p className="expense-description">{expense.description}</p>
          )}
          
          <div className="expense-details">
            <div className="expense-creator">
              <span className="label">Created by:</span>
              <span className="value">{expense.creator.name}</span>
            </div>
            <div className="expense-amount">
              <span className="label">Your Share:</span>
              <span className="value">${calculateShare(expense, user._id).toFixed(2)}</span>
            </div>
            <div className="expense-date">
              <span className="label">Date:</span>
              <span className="value">{formatDate(expense.date)}</span>
            </div>
          </div>
          
          {!myParticipation.paid && (
            <button 
              className="btn btn-primary pay-button"
              onClick={() => handlePayExpense(expense._id)}
            >
              Mark as Paid
            </button>
          )}
        </div>
      );
    });
  };

  return (
    <div className="expense-list-container">
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="expense-tabs">
        <button 
          className={`tab-button ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => setActiveTab('created')}
        >
          Expenses You Created
        </button>
        <button 
          className={`tab-button ${activeTab === 'participated' ? 'active' : ''}`}
          onClick={() => setActiveTab('participated')}
        >
          Expenses You're In
        </button>
      </div>
      
      <div className="expense-list">
        {activeTab === 'created' ? renderCreatedExpenses() : renderParticipatedExpenses()}
      </div>
    </div>
  );
};

export default ExpenseList;