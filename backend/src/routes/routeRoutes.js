const express = require("express");
const { getRoute } = require("../services/routingService");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const route = await getRoute(req.body);
    res.json({ route });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
