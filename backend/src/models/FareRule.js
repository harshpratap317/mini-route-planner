const mongoose = require("mongoose");

const fareRuleSchema = new mongoose.Schema(
  {
    provider: String,
    category: String,
    baseFare: Number,
    perKmRate: Number,
    perMinuteRate: Number,
    surgeMultiplier: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("FareRule", fareRuleSchema);

