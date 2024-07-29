const History = require("../models/History");
const moment = require("moment-timezone");

module.exports = {
  getHistories: async (req, res) => {
    try {
      const histories = await History.find()
        .populate("createdBy", "name")
        .populate("patientUserId", "name email")
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
        .populate("patientUserId", "name email")
        .populate("psikologId", "name");
      res.json(history);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  addHistory: async (req, res) => {
    const { consultationDate, consultationTime } = req.body;

    // Jika consultationDate tidak disediakan, tetap menggunakan tanggal saat ini
    const newConsultationDate = consultationDate ? new Date(consultationDate) : new Date();

    // Memformat consultationTime agar hanya menampilkan jam dan menit dalam zona waktu WIB
    const formatTime = (timeString) => {
      const time = moment.tz(`1970-01-01T${timeString}:00`, "Asia/Jakarta");
      return time.format("HH:mm");
    };

    const newConsultationTime = consultationTime
      ? formatTime(consultationTime)
      : formatTime(moment().tz("Asia/Jakarta").format("HH:mm"));

    const newHistory = new History({
      createdBy: req.user._id,
      patientUserId: req.body.patientUserId,
      psikologId: req.user._id,
      notes: req.body.notes,
      diagnosis: req.body.diagnosis,
      treatment: req.body.treatment,
      consultationDate: newConsultationDate,
      consultationTime: newConsultationTime,
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
      const { consultationDate, consultationTime } = req.body;

      // Jika consultationDate tidak disediakan, tetap menggunakan tanggal saat ini
      const updatedConsultationDate = consultationDate ? new Date(consultationDate) : undefined;

      // Jika consultationTime tidak disediakan, tetap menggunakan waktu saat ini
      const updatedConsultationTime = consultationTime || new Date().toLocaleTimeString("en-US", { hour12: false });

      // Mencari dan memperbarui riwayat
      const updatedHistory = await History.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          consultationDate: updatedConsultationDate,
          consultationTime: updatedConsultationTime,
        },
        { new: true }
      )
        .populate("createdBy", "name")
        .populate("patientUserId", "name")
        .populate("psikologId", "name");

      if (!updatedHistory) {
        return res.status(404).json({ message: "History not found" });
      }

      res.json(updatedHistory);
    } catch (err) {
      console.log(err);
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
  getSummaryReport: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const query = {};
      if (startDate && endDate) {
        query.consultationDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      const totalConsultations = await History.countDocuments(query);
      const uniquePatients = await History.distinct("patientUserId", query).countDocuments();
      const consultationsPerPsychologist = await History.aggregate([
        { $match: query },
        { $group: { _id: "$psikologId", count: { $sum: 1 } } },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "psychologist" } },
        { $unwind: "$psychologist" },
        { $project: { psychologistName: "$psychologist.name", count: 1 } },
      ]);

      res.json({
        totalConsultations,
        uniquePatients,
        consultationsPerPsychologist,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  // Laporan Kinerja Psikolog
  getPsychologistPerformanceReport: async (req, res) => {
    try {
      const performance = await History.aggregate([
        {
          $group: {
            _id: "$psikologId",
            totalConsultations: { $sum: 1 },
            uniquePatients: { $addToSet: "$patientUserId" },
          },
        },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "psychologist" } },
        { $unwind: "$psychologist" },
        {
          $project: {
            psychologistName: "$psychologist.name",
            totalConsultations: 1,
            uniquePatientsCount: { $size: "$uniquePatients" },
          },
        },
      ]);

      res.json(performance);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Laporan Tren
  getTrendsReport: async (req, res) => {
    try {
      const { period } = req.query; // 'daily', 'weekly', 'monthly'
      let groupBy;

      switch (period) {
        case "daily":
          groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$consultationDate" } };
          break;
        case "weekly":
          groupBy = { $week: "$consultationDate" };
          break;
        case "monthly":
        default:
          groupBy = { $dateToString: { format: "%Y-%m", date: "$consultationDate" } };
      }

      const trends = await History.aggregate([
        {
          $group: {
            _id: groupBy,
            count: { $sum: 1 },
            diagnoses: { $push: "$diagnosis" },
            treatments: { $push: "$treatment" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            period: "$_id",
            count: 1,
            topDiagnosis: {
              $arrayElemAt: [
                {
                  $sortArray: {
                    input: {
                      $objectToArray: {
                        $arrayToObject: {
                          $map: {
                            input: { $setUnion: "$diagnoses" },
                            as: "d",
                            in: {
                              k: "$$d",
                              v: { $size: { $filter: { input: "$diagnoses", cond: { $eq: ["$$this", "$$d"] } } } },
                            },
                          },
                        },
                      },
                    },
                    sortBy: { v: -1 },
                  },
                },
                0,
              ],
            },
            topTreatment: {
              $arrayElemAt: [
                {
                  $sortArray: {
                    input: {
                      $objectToArray: {
                        $arrayToObject: {
                          $map: {
                            input: { $setUnion: "$treatments" },
                            as: "t",
                            in: {
                              k: "$$t",
                              v: { $size: { $filter: { input: "$treatments", cond: { $eq: ["$$this", "$$t"] } } } },
                            },
                          },
                        },
                      },
                    },
                    sortBy: { v: -1 },
                  },
                },
                0,
              ],
            },
          },
        },
      ]);

      res.json(trends);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
