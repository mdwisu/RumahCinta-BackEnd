const { default: mongoose } = require("mongoose");
const Konsul = require("../models/konsul");
const Payment = require("../models/payments");

module.exports = {
  getAllKonsul: async (req, res) => {
    try {
      let query = {}; // Default query to fetch all Konsul data
      const { user_id = false } = req.query;

      if (user_id) {
        // If userId is provided in the query, fetch Konsul data for that specific user
        query = { user_id: mongoose.Types.ObjectId(user_id) };
      }

      let konsul = await Konsul.find(query, "-__v")
        .populate("user_id", "-_id -email -password -role -isVerified -__v")
        .populate("psikolog_id")
        .exec();

      res.json({
        konsul,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getKonsulById: async (req, res) => {
    try {
      const { id } = req.params;
      const konsul = await Konsul.findById(id, "-__v")
        .populate("psikolog_id", "-__v -password")
        .populate(
          "user_id",
          "-_id -email -password -role -is_verified -__v -date_birth -place_birth -is_verified -created_at -updated_at -gender"
        );
      console.log(konsul);
      res.status(200).json({
        message: "Sukses mendapatkan data konsul",
        data: konsul,
      });
    } catch (error) {
      console.log(error);
    }
  },

  getKonsulByPaymentStatus: async (req, res) => {
    try {
      const id_psikolog = req.user._id;

      // Gunakan agregasi untuk mencari konsultasi dengan status "Pembayaran Diterima" dan sesuai psikologId
      const konsultasiDiterima = await Konsul.aggregate([
        {
          $match: {
            psikolog_id: mongoose.Types.ObjectId(id_psikolog),
          },
        },
        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "konsultasi_id",
            as: "payment",
          },
        },
        {
          $unwind: "$payment",
        },
        {
          $match: {
            "payment.status": "Pembayaran Sukses",
          },
        },
        {
          $lookup: {
            from: "users", // Use the appropriate collection name for the "User" model.
            localField: "psikolog_id",
            foreignField: "_id",
            as: "psikolog",
          },
        },
        {
          $unwind: "$psikolog",
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            _id: 1,
            riwayat: 1,
            keluhan: 1,
            psikolog: {
              nama: "$psikolog.name", // Include only the "nama" field for the psikolog
            },
            createdAt: 1,
            updatedAt: 1,
            user_id: 1,
            user_name: "$user.name",
            payment: "$payment",
          },
        },
      ]);

      res.status(200).json({
        message: "Sukses mendapatkan data konsultasi dengan pembayaran Sukses",
        data: konsultasiDiterima,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Terjadi kesalahan saat mengambil data konsultasi" });
    }
  },
  getKonslByUserId: async (req, res) => {
    try {
      const userId = req.user._id; // Ambil ID pengguna dari pengguna yang sedang login

      // Gunakan agregasi untuk mencari konsultasi dengan sesuai user_id
      const konsultasiByUserId = await Konsul.aggregate([
        {
          $match: {
            user_id: mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "users", // Use the appropriate collection name for the "User" model.
            localField: "psikolog_id",
            foreignField: "_id",
            as: "psikolog",
          },
        },
        {
          $unwind: "$psikolog",
        },
        {
          $lookup: {
            from: "payments", // Use the appropriate collection name for the "Payment" model.
            localField: "_id",
            foreignField: "konsultasi_id",
            as: "payment",
          },
        },
        {
          $unwind: {
            path: "$payment",
            preserveNullAndEmptyArrays: true, // Menjaga agar data konsultasi tetap ditampilkan meskipun tidak ada data payment
          },
        },
        {
          $project: {
            _id: 1,
            riwayat: 1,
            keluhan: 1,
            psikolog: {
              nama: "$psikolog.name", // Include only the "nama" field for the psikolog
            },
            createdAt: 1,
            updatedAt: 1,
            user_id: 1,
            payment: 1, // Include the payment data
          },
        },
      ]);

      res.status(200).json({
        message: "Sukses mendapatkan data konsultasi berdasarkan user ID",
        data: konsultasiByUserId,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Terjadi kesalahan saat mengambil data konsultasi" });
    }
  },

  addKonsul: async (req, res) => {
    const { riwayat, keluhan, psikolog_id } = req.body;
    const userId = req.user._id;

    const konsul = new Konsul({
      psikolog_id,
      riwayat,
      keluhan,
      user_id: userId,
    });

    const data = await konsul.save();
    console.log(data);

    res.status(200).json({
      message: "Konsultasi baru berhasil ditambahkan!",
      data: { id: data._id },
    });
  },

  updateKonsulById: async (req, res) => {
    const { riwayat, keluhan, psikolog_id } = req.body;

    const konsulId = req.params.id;
    const userId = req.user._id;

    console.log(konsulId);

    const updatedKonsul = {
      riwayat,
      keluhan,
      psikolog_id,
      user_id: userId,
    };

    try {
      const konsul = await Konsul.findById(konsulId);
      if (!konsul) {
        return res.status(404).json({ message: "Data Konsultasi tidak ditemukan." });
      }

      await Konsul.findByIdAndUpdate(konsulId, updatedKonsul);

      res.status(200).json({ message: "Consultation updated successfull" });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error updating consultation.",
        error: error.message,
      });
    }
  },

  deleteKonsulById: async (req, res) => {
    const { id } = req.params;
    const konsul = await Konsul.findById(id);

    await konsul.remove();

    res.json({
      message: "Data yang dipilih berhasil dihapus!",
      data: "terhapus",
    });
  },
};
