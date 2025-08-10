import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
      data: { type: Buffer, required: true },
      contentType: { type: String, required: true }
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    createdAt : { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
