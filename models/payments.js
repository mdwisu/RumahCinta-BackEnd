const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema({
  konsultasi_id: {
    type: Schema.Types.ObjectId,
    ref: "Konsul",
    require: true,
  },
  status: {
    type: String,
    enum: ["Pembayaran Diterima", "Pembayaran Sukses", "Pembayaran Ditolak"],
    require: true,
  },
  bukti_pembayaran: {
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

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
