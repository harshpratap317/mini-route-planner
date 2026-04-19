const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Demo User"
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    authProvider: {
      type: String,
      default: "demo"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);

