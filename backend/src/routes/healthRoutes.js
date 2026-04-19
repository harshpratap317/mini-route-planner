const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "mini-route-planner-api",
    phase: "complete",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
