import express from "express";
import multer from "multer";
import Blog from "../models/blog.js";

const router = express.Router();

// Configure Multer for Image Upload (memory storage)

// Route: Serve Blog Image by Blog ID
router.get("/image/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog || !blog.image || !blog.image.data) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.set("Content-Type", blog.image.contentType);
    res.send(blog.image.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route: Create a New Blog
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { name, title, description, author } = req.body;
    if (!name || !title || !description || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Store image as Buffer and contentType
    const image = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
    // Blog is created with status 'pending' by default
    const newBlog = await Blog.create({ name, title, description, image, author });
    res.status(201).json({ message: "Blog created successfully, pending admin approval", blog: newBlog });
  } catch (error) {
    console.error("Error in /create:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route: Get All Blogs (only approved)
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "pending" });
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
