const express = require("express");
const {
  getHistories,
  getHistoryById,
  addHistory,
  updateHistory,
  deleteHistory,
  getHistoriesByUserId,
  getSummaryReport,
  getPsychologistPerformanceReport,
  getTrendsReport,
  getPatientReport,
  getPatientConsultationData,
} = require("../controllers/histories.controller");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authUser");

router.get("/", verifyToken, authorizeRoles(["admin"]), getHistories);
router.get("/user", verifyToken, authorizeRoles(["user", "admin"]), getHistoriesByUserId);
router.get("/summary-report", verifyToken, authorizeRoles(["admin", "owner"]), getSummaryReport);
router.get(
  "/performance-psychologist",
  verifyToken,
  authorizeRoles(["admin", "owner"]),
  getPsychologistPerformanceReport
);
router.get("/trends-report", verifyToken, authorizeRoles(["admin", "owner"]), getTrendsReport);
router.get("/patient-report", verifyToken, authorizeRoles(["admin", "owner"]), getPatientReport);
router.get("/patient-consultation-data", getPatientConsultationData);
router.get("/:id", getHistoryById);
router.post("/", verifyToken, authorizeRoles(["admin"]), addHistory);
router.patch("/:id", verifyToken, authorizeRoles(["admin"]), updateHistory);
router.delete("/:id", verifyToken, authorizeRoles(["admin"]), deleteHistory);

module.exports = router;
