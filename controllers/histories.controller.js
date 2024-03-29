const History = require("../models/History");

module.exports = {
  getHistories: async (req, res) => {
    try {
      const histories = await History.find();
      res.json(histories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  getHistoriesByUserId: async (req, res) => {
    try {
      const histories = await History.find({ userId: req.user._id });
      res.json(histories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  getHistoryById: async (req, res) => {
    try {
      const history = await History.findById(req.params.id);
      res.json(history);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  addHistory: async (req, res) => {
    const newHistory = new History({
      createdBy: req.user._id,
      consultationDate: req.body.consultationDate,
      notes: req.body.notes,
      diagnosis: req.body.diagnosis,
      prescription: req.body.prescription,
      personalData: req.body.personalData,
      privateNotes: req.body.privateNotes,
    });

    try {
      const history = await newHistory.save();
      res.status(201).json(history);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  updateHistory: async (req, res) => {
    try {
      const history = await History.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(history);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  deleteHistory: async (req, res) => {
    try {
      await History.findByIdAndDelete(req.params.id);
      res.json({ message: "History deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
