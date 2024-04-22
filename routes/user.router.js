const express = require("express");
const router = express.Router();

const {
  getAllUser,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  updateProfilePicture,
  getUsersByNameOrEmail,
} = require("../controllers/user.controller");
const { verifyToken, authorizeRoles } = require("../middleware/authUser");

router.get("/", verifyToken, authorizeRoles(["admin", "user"]), getAllUser);
router.get("/:id", verifyToken, authorizeRoles(["admin"]), getUserById);
// router.post('/', verifyToken, authorizeRoles(['admin']), addUser);
router.post("/", addUser);
router.patch("/updateprofilepicture", verifyToken, updateProfilePicture);
router.patch("/:id", verifyToken, authorizeRoles(["admin"]), updateUser);
router.delete("/:id", verifyToken, authorizeRoles(["admin"]), deleteUser);
router.get("/search/:query", verifyToken, authorizeRoles(["admin"]), getUsersByNameOrEmail);

module.exports = router;
