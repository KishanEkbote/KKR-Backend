import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getAllUsers, updateUserRole, uploadProfileImage, getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for profile image uploads
const uploadDir = path.join('uploads', 'profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// User routes
router.get('/', protect, adminOnly, getAllUsers);
router.patch('/:id/role', protect, adminOnly, updateUserRole);

// Profile image upload route
router.post('/profile-image', upload.single('profileImage'), uploadProfileImage);

// Add these routes
router.get('/:id', getUserProfile);
router.put('/:id/update', protect, updateUserProfile);

export default router;
