const express = require("express");
const router = express.Router();

const { verifyToken, authorizeRoles } = require("../middleware/authUser");
const {
  getAllPayment,
  getPaymentById,
  createPayment,
  updatePaymentById,
  deletePaymentById,
} = require("../controllers/payment.controller");
const upload = require("../middleware/multerConfig");

router.get("/", getAllPayment);
router.get("/:id", getPaymentById);
router.post("/", verifyToken, authorizeRoles(["admin", "user"]), upload.single("bukti_pembayaran"), createPayment);
router.patch("/:id", verifyToken, authorizeRoles(["admin", "user"]), updatePaymentById);
router.delete("/:id", verifyToken, authorizeRoles(["admin", "user"]), deletePaymentById);

module.exports = router;
