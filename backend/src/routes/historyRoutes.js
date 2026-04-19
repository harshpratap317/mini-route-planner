const express = require("express");
const { clearHistory, listHistory, saveHistory } = require("../services/historyService");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const userId = req.query.userId || "demo-user";
    const history = await listHistory(userId);
    res.json({ history });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const userId = req.body.userId || "demo-user";
    const item = await saveHistory(req.body, userId);
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const userId = req.query.userId || "demo-user";
    await clearHistory(userId);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

