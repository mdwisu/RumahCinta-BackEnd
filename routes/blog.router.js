const express = require("express");
const {
  getAllBlog,
  getBlogById,
  createBlog,
  deleteBlog,
  updateBlog,
  getLatestBlogs,
} = require("../controllers/blog.controller");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authUser");
const multer = require("multer");
const blogReportController = require("../controllers/blog.controller");
const upload = multer({ dest: "public/thumbnails" });

router.get("/", getAllBlog);
router.get("/latest", getLatestBlogs);
router.get("/summary", blogReportController.getBlogSummary);
router.get("/top-authors", blogReportController.getTopBlogAuthors);
router.get("/trends", blogReportController.getBlogTrends);
router.get("/recent", blogReportController.getRecentBlogs);
router.get("/:id", getBlogById);
router.post("/", verifyToken, authorizeRoles(["admin"]), createBlog);
router.patch("/:id", verifyToken, authorizeRoles(["admin"]), updateBlog);
router.delete("/:id", verifyToken, authorizeRoles(["admin"]), deleteBlog);
module.exports = router;
