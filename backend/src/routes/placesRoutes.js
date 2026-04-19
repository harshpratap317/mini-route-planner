const express = require("express");
const { getNearbyPlaces } = require("../services/placesService");

const router = express.Router();

router.get("/nearby", async (req, res, next) => {
  try {
    const result = await getNearbyPlaces(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

