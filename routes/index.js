const express = require("express");
const router = express.Router();

const videoRouter = require("./video.router");
const userRouter = require("./user.router");
const authRouter = require("./auth.router");
const blogRouter = require("./blog.router");
const faqRouter = require("./faq.route");
const konsulRouter = require("./konsul.router");
const paymentRouter = require("./payment.router");
const psikologRouter = require("./psikolog.router");

router.get("/", (req, res) => {
  res.send("<h1></h1>Welcome To Mental Hack API</h1>");
});

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/blog", blogRouter);
router.use("/video", videoRouter);
router.use("/faq", faqRouter);
router.use("/konsul", konsulRouter);
router.use("/payment", paymentRouter);
router.use("/psikolog", psikologRouter);

module.exports = router;
