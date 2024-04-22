const History = require("../models/History");

module.exports = {
  getHistories: async (req, res) => {
    try {
      const histories = await History.find()
        .populate("createdBy", "name")
        .populate("patientUserId", "name")
        .populate("psikologId", "name");
      res.json(histories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getHistoriesByUserId: async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Anda belum login" });
    }
    try {
      const histories = await History.find({ patientUserId: req.user._id })
        .populate("createdBy", "name")
        .populate("psikologId", "name");
      res.json(histories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getHistoryById: async (req, res) => {
    try {
      const history = await History.findById(req.params.id)
        .populate("createdBy", "name")
        .populate("patientUserId", "name")
        .populate("psikologId", "name");
      res.json(history);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  addHistory: async (req, res) => {
    const consultationDate = req.body.consultationDate ? new Date(req.body.consultationDate) : new Date();
    const newHistory = new History({
      createdBy: req.user._id,
      patientUserId: req.body.patientUserId,
      psikologId: req.user._id,
      notes: req.body.notes,
      diagnosis: req.body.diagnosis,
      prescription: req.body.prescription,
      consultationDate: consultationDate,
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
      const history = await History.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate("createdBy", "name")
        .populate("patientUserId", "name")
        .populate("psikologId", "name");
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
