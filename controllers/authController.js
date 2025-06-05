import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

export const registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    bio,
    interests,
    location,
    website,
    socialLinks
  } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if this is the first user
    const isFirstUser = (await User.countDocuments()) === 0;
    const role = isFirstUser ? 'admin' : 'user'; // First user becomes admin

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with profile information
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role, // Assign role dynamically
      bio: bio || '',
      interests: interests || [],
      location: location || '',
      website: website || '',
      socialLinks: socialLinks || {
        twitter: '',
        instagram: '',
        facebook: '',
        linkedin: ''
      }
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      interests: user.interests,
      location: user.location,
      website: user.website,
      socialLinks: user.socialLinks,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
