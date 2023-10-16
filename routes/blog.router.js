const express = require('express');
const {
  getAllBlog,
  getBlogById,
  createBlog,

  deleteBlog,
  postComment,
  getAllBlogCommentById,
  deleteBlogCommentById,
  updateCommentById,
  updateBlog,
} = require('../controllers/blog.controller');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authUser');
const multer = require('multer');
const upload = multer({ dest: 'public/thumbnails' });

router.get('/', getAllBlog);
router.get('/:id', getBlogById);
router.post(
  '/',
  verifyToken,
  authorizeRoles(['admin']),
  createBlog
);
router.patch('/:id', verifyToken, authorizeRoles(['admin']), updateBlog);
router.delete('/:id', verifyToken, authorizeRoles(['admin']), deleteBlog);
module.exports = router;
