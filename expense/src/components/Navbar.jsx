import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          ExpenseSplitter
        </Link>
        
        <div className="navbar-profile" ref={dropdownRef}>
          <button className="profile-button" onClick={toggleDropdown}>
            {user.name.charAt(0).toUpperCase()}
          </button>
          
          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <p className="user-name">{user.name}</p>
                <p className="user-email">{user.email}</p>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                Profile
              </Link>
              
              <Link to="/history" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                Expense History
              </Link>
              
              <div className="dropdown-divider"></div>
              
              <button className="dropdown-item logout-button" onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;