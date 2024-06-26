const express = require("express");
const {
  getHistories,
  getHistoryById,
  addHistory,
  updateHistory,
  deleteHistory,
  getHistoriesByUserId,
} = require("../controllers/histories.controller");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authUser");

router.get("/", getHistories);
router.get("/user", verifyToken, authorizeRoles(["user", "admin"]), getHistoriesByUserId);
router.get("/:id", getHistoryById);
router.post("/", verifyToken, authorizeRoles(["admin"]), addHistory);
router.patch("/:id", updateHistory);
router.delete("/:id", deleteHistory);

module.exports = router;
