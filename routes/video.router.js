const express = require("express");
const router = express.Router();

const {
  getAllVideo,
  getVideoById,
  addVideo,
  updateVideoById,
  deleteVideoById,
  getAllCommentByVideo,
  addComment,
  deleteComment,
  getLatestVideo,
} = require("../controllers/video.controller");
const videoReportController = require("../controllers/video.controller");
const { verifyToken, authorizeRoles } = require("../middleware/authUser");

router.get("/", getAllVideo);
router.get("/latest", getLatestVideo);
router.get("/summary", videoReportController.getVideoSummary);
router.get("/top-authors", videoReportController.getTopVideoAuthors);
router.get("/trends", videoReportController.getVideoTrends);
router.get("/recent", videoReportController.getRecentVideos);
router.get("/:id", getVideoById);
router.post("/", verifyToken, authorizeRoles(["admin"]), addVideo);
router.patch("/:id", verifyToken, authorizeRoles(["admin"]), updateVideoById);
router.delete("/:id", verifyToken, authorizeRoles(["admin"]), deleteVideoById);
router.get("/:id/comment", getAllCommentByVideo);
router.post("/:id/comment", verifyToken, addComment);
router.delete("/:id/comment/:commentID", verifyToken, authorizeRoles(["admin"]), deleteComment);

module.exports = router;
