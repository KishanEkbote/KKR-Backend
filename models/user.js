import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'editor', 'admin'], default: 'user' },
  // Additional profile fields for blog users
  bio: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  interests: [{ type: String }],
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  socialLinks: {
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
