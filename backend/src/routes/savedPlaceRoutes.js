const express = require("express");
const {
  createSavedPlace,
  deleteSavedPlace,
  listSavedPlaces
} = require("../services/savedPlaceService");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const userId = req.query.userId || "demo-user";
    const places = await listSavedPlaces(userId);
    res.json({ places });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const userId = req.body.userId || "demo-user";
    const place = await createSavedPlace(req.body, userId);
    res.status(201).json({ place });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.query.userId || "demo-user";
    await deleteSavedPlace(req.params.id, userId);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

