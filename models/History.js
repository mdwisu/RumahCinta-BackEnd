const mongoose = require("mongoose");
const { Schema } = mongoose;

const HistorySchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientUserId: {
    type: Schema.Types.ObjectId,
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
    prescription: {
      type: String,
    },
    consultationDate: {
      type: Date,
    },
    personalData: {
      type: String,
    },
    privateNotes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", HistorySchema);
