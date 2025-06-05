import User from '../models/user.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.role = req.body.role || user.role;
      await user.save();
      res.json({ message: 'User role updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle profile image upload
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user profile with image path
    const imagePath = `/uploads/profiles/${req.file.filename}`;
    user.profileImage = imagePath;
    await user.save();

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      profileImage: imagePath
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user profile by ID
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data without password
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      profileImage: user.profileImage,
      interests: user.interests,
      location: user.location,
      website: user.website,
      socialLinks: user.socialLinks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.location = req.body.location || user.location;
    user.website = req.body.website || user.website;
    user.interests = req.body.interests || user.interests;
    
    if (req.body.socialLinks) {
      user.socialLinks = {
        twitter: req.body.socialLinks.twitter || user.socialLinks.twitter,
        instagram: req.body.socialLinks.instagram || user.socialLinks.instagram,
        facebook: req.body.socialLinks.facebook || user.socialLinks.facebook,
        linkedin: req.body.socialLinks.linkedin || user.socialLinks.linkedin
      };
    }
    
    await user.save();
    
    res.json({
      _id: user._id,
      name: user.name,
      bio: user.bio,
      profileImage: user.profileImage,
      interests: user.interests,
      location: user.location,
      website: user.website,
      socialLinks: user.socialLinks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
