const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    psikologId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    prescription: String,
    consultationDate: {
      type: Date,
      required: true,
    },
    personalData: String,
    privateNotes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);
