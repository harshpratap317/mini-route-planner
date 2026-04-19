const SearchHistory = require("../models/SearchHistory");
const createHttpError = require("../utils/httpError");
const { isDatabaseReady } = require("./databaseState");

const inMemoryHistory = [];
const MAX_HISTORY_ITEMS = 8;

function normalizePoint(point, name) {
  if (!point || !Number.isFinite(Number(point.lat)) || !Number.isFinite(Number(point.lng))) {
    throw createHttpError(`${name} must include valid lat and lng values.`, 400);
  }

  return {
    label: point.label || `${Number(point.lat).toFixed(5)}, ${Number(point.lng).toFixed(5)}`,
    lat: Number(point.lat),
    lng: Number(point.lng),
    source: point.source || "unknown"
  };
}

function toHistoryResponse(item) {
  return {
    id: item._id?.toString?.() || item.id,
    pickup: item.pickup,
    destination: item.destination,
    distanceKm: item.distanceKm,
    etaLabel: item.etaLabel,
    durationMinutes: item.durationMinutes,
    cheapestProvider: item.cheapestProvider,
    cheapestFare: item.cheapestFare,
    createdAt: item.createdAt
  };
}

async function listHistory(userId = "demo-user") {
  if (isDatabaseReady()) {
    const history = await SearchHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(MAX_HISTORY_ITEMS)
      .lean();

    return history.map(toHistoryResponse);
  }

  return inMemoryHistory.filter((item) => item.userId === userId).slice(0, MAX_HISTORY_ITEMS);
}

async function saveHistory(payload, userId = "demo-user") {
  const historyItem = {
    userId,
    pickup: normalizePoint(payload.pickup, "Pickup"),
    destination: normalizePoint(payload.destination, "Destination"),
    distanceKm: Number(payload.distanceKm || 0),
    etaLabel: payload.etaLabel || "",
    durationMinutes: Number(payload.durationMinutes || 0),
    cheapestProvider: payload.cheapestProvider || "",
    cheapestFare: Number(payload.cheapestFare || 0)
  };

  if (isDatabaseReady()) {
    const saved = await SearchHistory.create(historyItem);
    return toHistoryResponse(saved);
  }

  const saved = {
    ...historyItem,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString()
  };

  inMemoryHistory.unshift(saved);

  while (inMemoryHistory.length > MAX_HISTORY_ITEMS) {
    inMemoryHistory.pop();
  }

  return saved;
}

async function clearHistory(userId = "demo-user") {
  if (isDatabaseReady()) {
    await SearchHistory.deleteMany({ userId });
    return { deleted: true };
  }

  for (let index = inMemoryHistory.length - 1; index >= 0; index -= 1) {
    if (inMemoryHistory[index].userId === userId) {
      inMemoryHistory.splice(index, 1);
    }
  }

  return { deleted: true };
}

module.exports = {
  clearHistory,
  listHistory,
  saveHistory
};

