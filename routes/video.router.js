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
} = require("../controllers/video.controller");
const { verifyToken, authorizeRoles } = require("../middleware/authUser");

router.get("/", getAllVideo);
router.get("/:id", getVideoById);
router.post("/", verifyToken, authorizeRoles(["admin"]), addVideo);
router.patch("/:id", verifyToken, authorizeRoles(["admin"]), updateVideoById);
router.delete("/:id", verifyToken, authorizeRoles(["admin"]), deleteVideoById);
router.get("/:id/comment", getAllCommentByVideo);
router.post("/:id/comment", verifyToken, addComment);
router.delete(
  "/:id/comment/:commentID",
  verifyToken,
  authorizeRoles(["admin"]),
  deleteComment
);

module.exports = router;
