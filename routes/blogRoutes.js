import express from "express";
import multer from "multer";
import Blog from "../models/blog.js";

const router = express.Router();

// Configure Multer for Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Route: Create a New Blog
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    console.log("Request received:", req.body);
    console.log("Uploaded file:", req.file);

    const { name, title, description, author } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !title || !description || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

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
