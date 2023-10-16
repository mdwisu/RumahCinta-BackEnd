const express = require("express");
const router = express.Router();

const {
  getAllKonsul,
  getKonsulById,
  addKonsul,
  updateKonsulById,
  deleteKonsulById,
  getKonsulByPaymentStatus,
  getKonslByUserId,
} = require("../controllers/konsul.controller");
const { verifyToken, authorizeRoles } = require("../middleware/authUser");

router.get("/", getAllKonsul);
router.get("/pembayaran-sukses", verifyToken, authorizeRoles(["admin", "psikolog"]), getKonsulByPaymentStatus);
router.get("/user", verifyToken, authorizeRoles(["admin", "user", "psikolog"]), getKonslByUserId);
router.get("/:id", getKonsulById);
router.post("/", verifyToken, authorizeRoles(["admin", "user"]), addKonsul);
router.patch("/:id", verifyToken, authorizeRoles(["admin", "user"]), updateKonsulById);
router.delete("/:id", verifyToken, authorizeRoles(["admin", "user"]), deleteKonsulById);

module.exports = router;
