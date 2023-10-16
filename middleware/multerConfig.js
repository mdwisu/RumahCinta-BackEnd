const multer = require("multer");
const fs = require("fs");

// Konfigurasi penyimpanan file menggunakan multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "thumbnail") {
      const folderPath = "public/thumbnails";
      createFolderIfNotExists(folderPath);
      cb(null, folderPath);
    } else if (file.fieldname === "profile") {
      const folderPath = "public/profiles";
      createFolderIfNotExists(folderPath);
      cb(null, folderPath);
    } else if (file.fieldname === "ktp") {
      const folderPath = "public/ktp";
      createFolderIfNotExists(folderPath);
      cb(null, folderPath);
    } else if (file.fieldname === "ijazah") {
      const folderPath = "public/ijazah";
      createFolderIfNotExists(folderPath);
      cb(null, folderPath);
    } else if (file.fieldname === "bukti_pembayaran") {
      const folderPath = "public/buktiPembayaran";
      createFolderIfNotExists(folderPath);
      cb(null, folderPath);
    } else {
      cb(new Error("Invalid fieldname"), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

// Fungsi untuk membuat folder jika folder tidak ada
function createFolderIfNotExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

// Inisialisasi multer dengan konfigurasi penyimpanan
const upload = multer({
  storage: storage,
  onError: function (err, next) {
    console.log("Multer Error:", err);
    next(err);
  },
});

module.exports = upload;
