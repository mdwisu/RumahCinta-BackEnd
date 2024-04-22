const mongoose = require("mongoose");
const { Schema } = mongoose;

const videoSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  videoId: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  author: {
    type: String,
    require: true,
  },
  content: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
});

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
