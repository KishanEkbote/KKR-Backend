import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import multer from "multer";
import connectDB from "./config/db.js";
import getHotelsRouter from "./api/get_hotels.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import Blog from "./models/blog.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url"; 

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Manually define __dirname

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// API to fetch route data
app.post("/get-route", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      req.body,
      {
        headers: {
          Authorization: process.env.OPENROUTESERVICE_API_KEY, // Use environment variable
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch route" });
  }
});

// API Routes
app.use("/api", getHotelsRouter);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/blogs", blogRoutes);


const uploadDir = path.join("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({  
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Ensure it exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
// Blog creation route
app.post("/blogs/create", upload.single("image"), async (req, res) => {
  try {
     // Log incoming request
     console.log("Received blog data:", req.body);
     console.log("Uploaded file:", req.file);
    const { title, description, author } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null; // Store file path

    if (!title || !description || !author) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newBlog = new Blog({ title, description, image, author });
    await newBlog.save();

    res.status(201).json({ message: "Blog created successfully!" });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
