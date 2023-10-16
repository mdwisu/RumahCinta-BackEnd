const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatSchema = new Schema({
  message: {
    type: String,
    require: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  konsulId: {
    type: Schema.Types.ObjectId,
    ref: "Konsul",
    require: true,
  },
  timestamp: {
    type: Date,
    default: Date.now(),
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

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
