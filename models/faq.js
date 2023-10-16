const mongoose = require("mongoose");
const { Schema } = mongoose;

const faqSchema = new Schema({
  nama: {
    type: String,
    require: true,
  },
  nomor_handphone: {
    type: String,
    require: true,
  },
  pesan: {
    type: String,
    require: true,
  },
});

const Faq = mongoose.model("Faq", faqSchema);

module.exports = Faq;
