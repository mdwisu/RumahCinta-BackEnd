const User = require("../models/user");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

module.exports = {
  getAllUser: async (req, res) => {
    let { role = false, isPsikolog = false } = req.query;

    try {
      let users = await User.find({}, "-__v -password");
      if (role) {
        users = await User.find({
          role: { $regex: role, $options: "i" },
        });
        if (isPsikolog) {
          users = await User.find({
            role: { $regex: role, $options: "i" },
            isPsikolog: isPsikolog,
          });
        }
      }

      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id, "-__v -password");
      res.json(user);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  addUser: async (req, res) => {
    let data = req.body;
    const saltRounds = 10;
    const hash = bcrypt.hashSync(data.password, saltRounds);
    data.password = hash;
    data.profile = `profile/default-user.jpg`;
    const user = new User(data);
    try {
      const insertedUser = await user.save();
      res.status(201).json(insertedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  updateUser: async (req, res) => {
    let data = req.body;
    if (data.password) {
      const saltRounds = 10;
      const hash = bcrypt.hashSync(data.password, saltRounds);
      data.password = hash;
    }
    try {
      const updatedUser = await User.updateOne({ _id: req.params.id }, { $set: data }, { runValidators: true });
      res.status(200).json({ updatedUser, message: "data berhasil di update" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  deleteUser: async (req, res) => {
    try {
      // find user
      const user = await User.findById({ _id: req.params.id });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      } // Check if profile_url exists and is not "default.jpg"
      if (user.profile_url) {
        const img = user.profile_url.split("/").pop();
        if (img !== "default.jpg") {
          const filepath = `./public/images/${img}`;
          fs.unlinkSync(filepath);
        }
      }

      // Delete user in db
      const deletedUser = await User.deleteOne({ _id: req.params.id });
      res.status(200).json({
        message: "User Deleted Successfully",
        data: deletedUser,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateProfilePicture: async (req, res) => {
    if (req.files === null) return res.status(400).json({ message: "No File Uploaded" });
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowType = [".png", ".jpg", ".jpeg"];

    if (!allowType.includes(ext.toLowerCase())) return res.status(422).json({ message: "Invalid Images" });
    if (fileSize > 5000000) return res.status(422).json({ message: "Image must be less than 5MB" });

    file.mv(`./public/images/${fileName}`, async (error) => {
      if (error) res.status(500).json({ message: error.message });
      try {
        await User.updateOne({ _id: req.session.userId }, { $set: { profile_url: url } });
        res.status(201).json({ message: "Image Profile Updated" });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });
  },
  getUsersByNameOrEmail: async (req, res) => {
    const { query } = req.params;
    try {
      const users = await User.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
        role: "user",
      }).select("name email");
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
