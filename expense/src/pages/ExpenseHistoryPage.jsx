import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getExpenses } from '../services/api';
import './ExpenseHistoryPage.css';

const ExpenseHistoryPage = ({ user }) => {
  const [expenses, setExpenses] = useState({ created: [], participated: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpenses = async () => {
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

    fetchExpenses();
  }, [user.token]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Combine and sort all expenses by date
  const allExpenses = [...expenses.created, ...expenses.participated].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="history-page">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="container main-content">
        <h1 className="page-title">Expense History</h1>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading expenses...</div>
        ) : (
          <div className="history-container">
            {allExpenses.length === 0 ? (
              <p className="no-expenses-message">You don't have any expenses yet.</p>
            ) : (
              <div className="expense-timeline">
                {allExpenses.map((expense) => {
                  const isCreator = expense.creator._id === user._id;
                  const myParticipation = !isCreator && expense.participants.find(
                    p => p.user._id === user._id
                  );
                  
                  return (
                    <div key={expense._id} className="timeline-item">
                      <div className="timeline-date">
                        {formatDate(expense.date)}
                      </div>
                      
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <h3 className="timeline-title">{expense.title}</h3>
                          <span className={`timeline-status ${
                            isCreator 
                              ? (expense.settled ? 'settled' : 'pending')
                              : (myParticipation.paid ? 'paid' : 'unpaid')
                          }`}>
                            {isCreator 
                              ? (expense.settled ? 'Settled' : 'Pending')
                              : (myParticipation.paid ? 'Paid' : 'Unpaid')}
                          </span>
                        </div>
                        
                        {expense.description && (
                          <p className="timeline-description">{expense.description}</p>
                        )}
                        
                        <div className="timeline-details">
                          {isCreator ? (
                            <>
                              <div className="timeline-role">You created this expense</div>
                              <div className="timeline-amount">
                                Total: ${expense.amount.toFixed(2)}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="timeline-role">
                                Created by: {expense.creator.name}
                              </div>
                              <div className="timeline-amount">
                                Your share: ${(expense.amount / (expense.participants.length + 1)).toFixed(2)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseHistoryPage;