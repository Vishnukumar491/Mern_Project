import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUserProfile } from '../services/api';
import './ProfilePage.css';

const ProfilePage = ({ user, setUser }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(user.token);
        setProfile(data);
      } catch (error) {
        setError('Failed to load profile');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user.token]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="container main-content">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="container main-content">
        <h1 className="page-title">Profile</h1>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        {profile && (
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-avatar">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{profile.name}</h2>
                <p className="profile-email">{profile.email}</p>
                <p className="profile-joined">
                  Joined on {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="profile-actions">
              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;