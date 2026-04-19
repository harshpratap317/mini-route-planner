const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    category: String,
    lat: Number,
    lng: Number,
    distanceKm: Number,
    source: String
  },
  { _id: false }
);

const placesCacheSchema = new mongoose.Schema(
  {
    cacheKey: {
      type: String,
      unique: true,
      index: true
    },
    center: {
      lat: Number,
      lng: Number
    },
    radiusMeters: Number,
    places: [placeSchema],
    expiresAt: {
      type: Date,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PlacesCache", placesCacheSchema);

