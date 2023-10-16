const express = require("express");
const { getFaqs, addFaq, updateFaq, deleteFaq, getFaqById } = require("../controllers/faq.controller");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authUser");

router.get("/", getFaqs);
router.get("/:id", getFaqById);
router.post("/", addFaq);
router.patch("/:id", updateFaq);
router.delete("/:id", deleteFaq);

module.exports = router;
