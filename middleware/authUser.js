const ConfigAuth = require("../config/ConfigAuth");
const Auth = require("../config/ConfigAuth");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  verifyToken: (req, res, next) => {
    // get token
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    // if (token == null) return res.sendStatus(401);
    // cek token lagi
    if (!token) {
      return res.status(401).json({ message: "Mohon login ke akun anda!" });
    }
    // verify token
    jwt.verify(token, ConfigAuth.jwt_secret, (err, decoded) => {
      if (err) return res.sendStatus(403);
      next();
    });
  },
  authorizeRoles: (roles) => {
    // role: admin, user, event_organizer, musisi
    return (req, res, next) => {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      try {
        const decoded = jwt.verify(token, Auth.jwt_secret);
        const { role } = decoded;
        if (!roles.includes(role)) {
          return res.status(403).json({ message: "Unauthorized" });
        }
        req.user = decoded; // Menyimpan data user pada objek req
        next();
      } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Invalid token" });
      }
    };
  },
};
