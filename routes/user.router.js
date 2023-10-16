const express = require("express");
const router = express.Router();

const {
  getAllUser,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  updateProfilePicture,
} = require("../controllers/user.controller");
const { verifyToken, authorizeRoles } = require("../middleware/authUser");

router.get("/", verifyToken, authorizeRoles(["admin", "user"]), getAllUser);
router.get("/:id", verifyToken, authorizeRoles(["admin"]), getUserById);
// router.post('/', verifyToken, authorizeRoles(['admin']), addUser);
router.post("/", addUser);
router.patch("/updateprofilepicture", verifyToken, updateProfilePicture);
router.patch("/:id", verifyToken, authorizeRoles(["admin"]), updateUser);
router.delete("/:id", verifyToken, authorizeRoles(["admin"]), deleteUser);

module.exports = router;
