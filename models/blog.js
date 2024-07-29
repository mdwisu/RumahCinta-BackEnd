const mongoose = require("mongoose");
const { Schema } = mongoose;

const blogSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  author: {
    type: String,
    required: [true, "Author is required"],
  },
  content: {
    type: String,
    required: [true, "Content is required"],
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  thumbnail: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
