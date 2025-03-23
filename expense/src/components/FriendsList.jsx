import { useState, useEffect } from 'react';
import { getFriends, addFriend, removeFriend } from '../services/api';
import './FriendsList.css';

const FriendsList = ({ user }) => {
  const [friends, setFriends] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadFriends();
  }, [user.token]);

  const loadFriends = async () => {
    try {
      const data = await getFriends(user.token);
      setFriends(data);
    } catch (error) {
      setError('Failed to load friends');
      console.error(error);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await addFriend({ email }, user.token);
      setEmail('');
      setSuccess('Friend added successfully!');
      loadFriends();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add friend');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      setLoading(true);
      try {
        await removeFriend(friendId, user.token);
        setSuccess('Friend removed successfully!');
        loadFriends();
      } catch (error) {
        setError('Failed to remove friend');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="friends-container">
      <h2 className="friends-title">Friends</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleAddFriend} className="add-friend-form">
        <div className="form-group add-friend-input">
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter friend's email"
            required
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary add-friend-button" 
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Friend'}
        </button>
      </form>
      
      <div className="friends-list-container">
        {friends.length === 0 ? (
          <p className="no-friends-message">You haven't added any friends yet.</p>
        ) : (
          <ul className="friends-list">
            {friends.map((friend) => (
              <li key={friend._id} className="friend-item">
                <div className="friend-info">
                  <div className="friend-avatar">{friend.name.charAt(0).toUpperCase()}</div>
                  <div className="friend-details">
                    <h3 className="friend-name">{friend.name}</h3>
                    <p className="friend-email">{friend.email}</p>
                  </div>
                </div>
                <button 
                  className="btn btn-danger remove-friend-button" 
                  onClick={() => handleRemoveFriend(friend._id)}
                  disabled={loading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FriendsList;