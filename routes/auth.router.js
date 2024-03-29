const express = require("express");
const {
  register,
  Login,
  verify,
  resendVerification,
  registerPsikolog,
  statusPsikolog,
  validateToken,
} = require("../controllers/auth.controller");
const upload = require("../middleware/multerConfig");
const { verifyToken, authorizeRoles } = require("../middleware/authUser");

const router = express.Router();

router.post(
  "/register/psikolog",
  verifyToken,
  authorizeRoles(["user"]),
  upload.fields([
    { name: "ktp", maxCount: 1 },
    { name: "ijazah", maxCount: 1 },
  ]),
  registerPsikolog
);
router.post("/status/psikolog", verifyToken, authorizeRoles(["admin"]), statusPsikolog);
router.post(
  "/register",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "ktp", maxCount: 1 },
    { name: "ijazah", maxCount: 1 },
  ]),
  register
);
router.post("/login", Login);
router.get("/verify/:id", verify);
router.post("/resendverify", resendVerification);
router.post("/validate-token", validateToken);

module.exports = router;
