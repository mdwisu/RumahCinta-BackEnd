require("dotenv").config();
const User = require("../models/user");
const Psikolog = require("../models/psikolog");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { sendVerificationEmail, sendPasswordEmail } = require("../middleware/sendVerifycationEmail");
const { decryptID } = require("../helpers/encryptedID");
const Auth = require("../config/Auth");

// Fungsi untuk menghapus file
function deleteFilesIfExists(files) {
  files.forEach((file) => {
    if (file && file.path) {
      fs.unlinkSync(file.path);
    }
  });
}

module.exports = {
  register: async (req, res) => {
    // Get body data
    let {
      name,
      role = "user",
      gender,
      place_birth, // Tambahkan place_birth sesuai model User
      date_birth, // Ubah menjadi date_birth
      email,
      password,
      confPassword,
      is_verified = false,
    } = req.body;

    const profileFile = req.files && req.files.profile ? req.files.profile[0] : null;

    const MAX_PROFILE_FILE_SIZE = 5000000; // Maksimal 5MB (dalam byte)
    // Validasi ukuran berkas KTP
    if (profileFile && profileFile.size > MAX_PROFILE_FILE_SIZE) {
      // Delete the uploaded image if there is an error
      deleteFilesIfExists([profileFile]);
      return res.status(400).json({ message: "KTP file size exceeds the limit (5MB)" });
    }

    // Check if password and confirm password match
    if (password !== confPassword) {
      // Delete the uploaded image if there is an error
      deleteFilesIfExists([profileFile]);
      return res.status(400).json({ message: "Password and Confirm Password do not match" });
    }

    if (password) {
      // Hash password
      const saltRounds = 10;
      const hash = bcrypt.hashSync(password, saltRounds);
      password = hash;
    }

    let profileUrl = null; // Initialize profileUrl as null

    if (profileFile) {
      // If profileFile exists, set profileUrl accordingly
      profileUrl = `/profiles/${profileFile.filename}`;
    } else if (role === "user") {
      // If role is user and profileFile doesn't exist, set default profileUrl for user
      profileUrl = "profile/default-user.jpg";
    } else if (role === "psikolog") {
      // If role is psikolog and profileFile doesn't exist, set default profileUrl for psikolog
      profileUrl = "profile/default-psikolog.jpg";
    }

    try {
      // Create new user
      const user = new User({
        name,
        role,
        gender,
        place_birth,
        date_birth,
        email,
        password,
        is_verified,
        profile: profileUrl,
      });

      insertedUser = await user.save();

      // Assume sendVerificationEmail function is defined and works correctly
      await sendVerificationEmail(email, insertedUser._id);
      res.status(201).json({ message: "Registration is successful, please verify email" });
    } catch (error) {
      console.log(error);
      // Delete the uploaded image if there is an error
      deleteFilesIfExists([profileFile]);
      if (error.code === 11000) {
        res.status(400).json({ message: "Email already registered" });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  },

  registerPsikolog: async (req, res) => {
    const user_id = req.user._id;
    // Get body data
    let { status = "Menunggu", univ } = req.body;

    const ktpFile = req.files && req.files.ktp ? req.files.ktp[0] : null;
    const ijazahFile = req.files && req.files.ijazah ? req.files.ijazah[0] : null;

    const MAX_KTP_FILE_SIZE = 5000000; // Maksimal 5MB (dalam byte)
    const MAX_IJAZAH_FILE_SIZE = 10000000; // Maksimal 10MB (dalam byte)

    if (ktpFile && ktpFile.size > MAX_KTP_FILE_SIZE) {
      // Delete the uploaded image if there is an error
      deleteFilesIfExists([ktpFile, ijazahFile]);
      return res.status(400).json({ message: "KTP file size exceeds the limit (5MB)" });
    }
    // Validasi ukuran berkas Ijazah
    if (ijazahFile && ijazahFile.size > MAX_IJAZAH_FILE_SIZE) {
      // Delete the uploaded image if there is an error
      deleteFilesIfExists([ktpFile, ijazahFile]);
      return res.status(400).json({ message: "Ijazah file size exceeds the limit (10MB)" });
    }

    let ktpUrl = null;
    if (ktpFile) {
      ktpUrl = `/ktp/${ktpFile.filename}`;
    }
    let ijazahUrl = null;
    if (ijazahFile) {
      ijazahUrl = `/ijazah/${ijazahFile.filename}`;
    }

    const psikolog = new Psikolog({
      user_id,
      status,
      ijazah: ijazahUrl,
      ktp: ktpUrl,
      univ,
    });

    try {
      // Save psikolog to the database
      await psikolog.save();
      res.status(201).json({ message: "Registration is successful, please wait for the admin to check" });
    } catch (error) {
      deleteFilesIfExists([ktpFile, ijazahFile]);
      res.status(400).json({ message: error.message });
    }
  },

  statusPsikolog: async (req, res) => {
    const { user_id, status } = req.body;

    try {
      const user = await User.findById(user_id);
      const psikolog = await Psikolog.findOne({ user_id });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      psikolog.status = status;
      await psikolog.save();

      if (status == "Diterima") {
        user.role = "psikolog";
        await user.save();
      } else if (status == "Ditolak") {
        user.role = "user";
        await user.save();
      }

      res.json({ message: "berhasil" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  },

  Login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      // const psikolog = await Psikolog.findOne({ user_id: user.user_id });
      const psikolog = await Psikolog.findOne({ user_id: user._id });
      if (!user) {
        return res.status(401).json({ message: "Email is not registered" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Password is not correct" });
      }

      if (!user.is_verified) {
        return res.status(403).json({
          message: "Email is not verified, please verify it before logging in",
        });
      }

      const token = jwt.sign(
        {
          _id: user._id,
          name: user.name,
          role: user.role,
          gender: user.gender,
          date_birth: user.date_birth,
          email: user.email,
          is_verified: user.is_verified,
          psikologStatus: psikolog ? psikolog.status : null,
        },
        Auth.jwt_secret,
        { expiresIn: "1d" }
      );

      res.json({ message: "Logged in successfully", token });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "An internal server error occurred",
        message: err.message,
      });
    }
  },
  verify: async (req, res) => {
    const { id } = req.params;

    try {
      const id2 = decryptID(id);
      const user = await User.findById(id2);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.is_verified = true;
      await user.save();

      res.json({ message: "Email verified successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  },
  resendVerification: async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await sendVerificationEmail(email, user.id);

      res.json({ message: "Verification email has been resent" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "An internal server error occurred" });
    }
  },
  validateToken: async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Ambil token dari header Authorization

    if (!token) {
      return res.status(401).json({ message: "Token tidak disediakan" });
    }

    // Verifikasi token menggunakan secret key
    jwt.verify(token, Auth.jwt_secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token tidak valid" });
      }
      // Token valid, kirim respon berhasil
      return res.status(200).json({ message: "Token valid", decoded });
    });
  },
  registerWithAutoPassword: async (req, res) => {
    const { name, gender, place_birth, date_birth, email } = req.body;
    try {
      // generate password
      const password = Math.random().toString(36).slice(-8);
      // hash password
      // Hash password
      const saltRounds = 10;
      const hash = bcrypt.hashSync(password, saltRounds);
      // create new user
      const user = new User({
        name,
        role: "user",
        gender,
        place_birth,
        date_birth,
        email,
        password: hash,
        is_verified: true,
        profile: "profile/default-user.jpg",
      });

      const insertedUser = await user.save();
      // kirim email dengan password ke pengguna
      await sendPasswordEmail(email, password);

      res.status(201).json({ message: "Registration is successful, password has been sent to the email" });
    } catch (error) {
      console.log(error);
      if (error.code === 11000) {
        res.status(400).json({ message: "Email already registered" });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  },
};
