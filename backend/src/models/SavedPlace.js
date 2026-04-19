const mongoose = require("mongoose");

const savedPlaceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "demo-user",
      index: true
    },
    label: String,
    lat: Number,
    lng: Number,
    category: String,
    notes: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SavedPlace", savedPlaceSchema);

