const mongoose = require("mongoose");
const { Schema } = mongoose;

const konsulSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  psikolog_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  riwayat: {
    type: String,
    require: true,
  },
  keluhan: {
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
});

const Konsul = mongoose.model("Konsul", konsulSchema);
module.exports = Konsul;
