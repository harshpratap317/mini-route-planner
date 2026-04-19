const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema(
  {
    label: String,
    lat: Number,
    lng: Number,
    source: String
  },
  { _id: false }
);

const searchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "demo-user",
      index: true
    },
    pickup: pointSchema,
    destination: pointSchema,
    distanceKm: Number,
    etaLabel: String,
    durationMinutes: Number,
    cheapestProvider: String,
    cheapestFare: Number
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SearchHistory", searchHistorySchema);

