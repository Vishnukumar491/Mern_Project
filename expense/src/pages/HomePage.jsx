import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ExpenseForm from '../components/ExpenseForm';
import FriendsList from '../components/FriendsList';
import ExpenseList from '../components/ExpenseList';
import './HomePage.css';

const HomePage = ({ user }) => {
  const [refreshExpenses, setRefreshExpenses] = useState(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const handleExpenseAdded = () => {
    // Trigger a refresh of the expense list
    setRefreshExpenses(prev => prev + 1);
  };

  return (
    <div className="home-page">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="container main-content">
        <h1 className="page-title">Dashboard</h1>
        
        <div className="dashboard-grid">
          <div className="dashboard-main">
            <ExpenseForm user={user} onExpenseAdded={handleExpenseAdded} />
            <ExpenseList user={user} refreshTrigger={refreshExpenses} />
          </div>
          
          <div className="dashboard-sidebar">
            <FriendsList user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;