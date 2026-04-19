const express = require("express");
const { reverseGeocode, searchPlaces } = require("../services/geocodingService");

const router = express.Router();

router.get("/search", async (req, res, next) => {
  try {
    const places = await searchPlaces(req.query.q);
    res.json({ places });
  } catch (error) {
    next(error);
  }
});

router.get("/reverse", async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const place = await reverseGeocode(lat, lng);
    res.json({ place });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

