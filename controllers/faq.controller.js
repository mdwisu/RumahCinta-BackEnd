const Faq = require("../models/faq");

module.exports = {
  getFaqs: async (req, res) => {
    try {
      // execute query with page, limit, and filter values
      let faqs = await Faq.find().exec();
      // return response with posts, total pages, and current page
      res.json(faq);
    } catch (err) {
      console.error(err.message);
    }
  },
  getFaqById: async (req, res) => {
    try {
      const faqId = req.params.id; // Mengambil ID dari parameter URL
      const faq = await Faq.findById(faqId).exec(); // Mencari FAQ berdasarkan ID

      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }

      res.json({
        faq,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server error" });
    }
  },
  addFaq: async (req, res) => {
    let data = req.body;
    const faq = new Faq(data);
    try {
      const insertedFaq = await faq.save();
      res.status(201).json(insertedFaq);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  updateFaq: async (req, res) => {
    let data = req.body;
    try {
      const updatedFaq = await Faq.updateOne({ _id: req.params.id }, { $set: data }, { runValidators: true });
      res.status(200).json(updatedFaq);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  deleteFaq: async (req, res) => {
    try {
      const deleteFaq = await Faq.deleteOne({ _id: req.params.id });
      res.status(200).json({
        message: "faq Deleted Successfully",
        data: deleteFaq,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};
