import User from '../models/userModel.js';

// @desc    Add a friend
// @route   POST /api/friends
// @access  Private
export const addFriend = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find friend by email
    const friend = await User.findOne({ email });
    
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if trying to add self
    if (friend._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot add yourself as a friend' });
    }
    
    // Check if already friends
    const user = await User.findById(req.user._id);
    
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }
    
    // Add friend to user's friend list
    user.friends.push(friend._id);
    await user.save();
    
    // Add user to friend's friend list
    friend.friends.push(user._id);
    await friend.save();
    
    res.status(200).json({ message: 'Friend added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all friends
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a friend
// @route   DELETE /api/friends/:id
// @access  Private
export const removeFriend = async (req, res) => {
  try {
    const friendId = req.params.id;
    
    // Remove friend from user's friend list
    const user = await User.findById(req.user._id);
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    await user.save();
    
    // Remove user from friend's friend list
    const friend = await User.findById(friendId);
    if (friend) {
      friend.friends = friend.friends.filter(id => id.toString() !== req.user._id.toString());
      await friend.save();
    }
    
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};