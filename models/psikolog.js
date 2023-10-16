const { default: mongoose, Schema, model } = require("mongoose");

const psikologSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  status: {
    type: String,
    enum: ["Menunggu", "Diterima", "Ditolak"],
  },
  ijazah: {
    type: String,
    required: [true, "Ijazah is required"],
  },
  ktp: {
    type: String,
    required: [true, "Ktp is required"],
  },
  univ: {
    type: String,
    required: [true, "Univ is required"],
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
});

const Psikolog = model("Psikolog", psikologSchema);

module.exports = Psikolog;
