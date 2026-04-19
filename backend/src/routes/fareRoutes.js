const express = require("express");
const { estimateFares } = require("../services/fareService");

const router = express.Router();

router.post("/estimate", (req, res, next) => {
  try {
    const estimates = estimateFares(req.body);

    res.json({
      estimates,
      pricingType: "demo-estimate",
      disclaimer: "Estimated fares for portfolio demo use only. Not official live provider pricing."
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

