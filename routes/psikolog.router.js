const express = require("express");
const router = express.Router();

const { verifyToken, authorizeRoles } = require("../middleware/authUser");
const {
  getAllPsikologRegis,
  getPsikologRegisterById,
  getPsikologStatusByUserId,
} = require("../controllers/psikolog.controller");

router.get("/registrasi/:psikologId", getPsikologRegisterById);
router.get("/registrasi", getAllPsikologRegis);
router.get("/status", verifyToken, authorizeRoles(["admin", "user"]), getPsikologStatusByUserId);

module.exports = router;
