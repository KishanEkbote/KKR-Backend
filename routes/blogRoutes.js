import express from "express";
import multer from "multer";
import Blog from "../models/blog.js";
import path from "path";
import fs from "fs";
import { fileExists, deleteFile, cleanupUnusedImages } from '../utils/imageUtils.js';

const router = express.Router();

// Configure Multer for Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create a URL-safe filename
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
    cb(null, `${Date.now()}-${sanitizedFilename}`);
  },
});

// Add file filter for image validation
const fileFilter = (req, file, cb) => {
  // Accept only jpeg, jpg, and png files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add periodic cleanup of unused images (run every 24 hours)
setInterval(async () => {
  try {
    // Get all blogs to check which images are in use
    const blogs = await Blog.find({});
    const usedImagePaths = blogs.map(blog => blog.image).filter(Boolean);
    
    // Run cleanup
    const uploadsDir = path.join(process.cwd(), "uploads");
    await cleanupUnusedImages(uploadsDir, usedImagePaths);
  } catch (error) {
    console.error('Error in image cleanup:', error);
  }
}, 24 * 60 * 60 * 1000);

// Route: Create a New Blog
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    console.log("Request received:", req.body);
    console.log("Uploaded file:", req.file);

    const { name, title, description, author } = req.body;
    // Store the relative path in the database
    const image = req.file ? path.join('uploads', req.file.filename).replace(/\\/g, '/') : null;

    if (!name || !title || !description || !image) {
      // Delete uploaded file if validation fails
      if (req.file) {
        await deleteFile(req.file.path);
      }
      return res.status(400).json({ message: "All fields are required" });
    }

    // Blog is created with status 'pending' by default
    const newBlog = await Blog.create({ name, title, description, image, author });
    res.status(201).json({ message: "Blog created successfully, pending admin approval", blog: newBlog });
  } catch (error) {
    // Delete uploaded file if blog creation fails
    if (req.file) {
      await deleteFile(req.file.path);
    }
    console.error("Error in /create:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route: Get All Blogs (only approved)
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "approved" });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Get All Pending Blogs (admin only)
router.get("/pending", async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "pending" });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Approve a Blog (admin only)
router.patch("/approve/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog approved", blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Reject a Blog (admin only)
router.patch("/reject/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog rejected", blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
