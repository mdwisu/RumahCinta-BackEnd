const { default: mongoose, Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  role: {
    type: String,
    enum: ["admin", "user", "psikolog"],
    // default: "user",
    required: [true, "Role is required"],
  },
  gender: {
    type: String,
    required: [true, "Gender is required"],
  },
  place_birth: {
    type: String,
  },
  date_birth: {
    type: Date,
    required: [true, "Date Of Birth is required"],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, "Email is required"],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    trim: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  profile: {
    type: String,
    default: function () {
      const req = this instanceof mongoose.Document ? this.$__.req : undefined;
      if (req) {
        return `${req.protocol}://${req.get("host")}/images/default.jpg`;
      }
      return undefined;
    },
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
});

const User = model("User", userSchema);

module.exports = User;
