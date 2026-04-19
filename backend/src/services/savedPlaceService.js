const SavedPlace = require("../models/SavedPlace");
const createHttpError = require("../utils/httpError");
const { isDatabaseReady } = require("./databaseState");

const inMemorySavedPlaces = [];
const MAX_SAVED_PLACES = 20;

function normalizeSavedPlace(payload, userId = "demo-user") {
  const lat = Number(payload.lat);
  const lng = Number(payload.lng);

  if (!payload.label?.trim()) {
    throw createHttpError("Place label is required.", 400);
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw createHttpError("Saved place must include valid lat and lng values.", 400);
  }

  return {
    userId,
    label: payload.label.trim(),
    lat,
    lng,
    category: payload.category || "Saved place",
    notes: payload.notes || ""
  };
}

function toSavedPlaceResponse(place) {
  return {
    id: place._id?.toString?.() || place.id,
    label: place.label,
    lat: place.lat,
    lng: place.lng,
    category: place.category,
    notes: place.notes,
    createdAt: place.createdAt
  };
}

async function listSavedPlaces(userId = "demo-user") {
  if (isDatabaseReady()) {
    const places = await SavedPlace.find({ userId }).sort({ createdAt: -1 }).limit(MAX_SAVED_PLACES).lean();
    return places.map(toSavedPlaceResponse);
  }

  return inMemorySavedPlaces.filter((place) => place.userId === userId).slice(0, MAX_SAVED_PLACES);
}

async function createSavedPlace(payload, userId = "demo-user") {
  const place = normalizeSavedPlace(payload, userId);

  if (isDatabaseReady()) {
    const saved = await SavedPlace.create(place);
    return toSavedPlaceResponse(saved);
  }

  const saved = {
    ...place,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString()
  };

  inMemorySavedPlaces.unshift(saved);

  while (inMemorySavedPlaces.length > MAX_SAVED_PLACES) {
    inMemorySavedPlaces.pop();
  }

  return saved;
}

async function deleteSavedPlace(id, userId = "demo-user") {
  if (!id) {
    throw createHttpError("Saved place id is required.", 400);
  }

  if (isDatabaseReady()) {
    await SavedPlace.deleteOne({ _id: id, userId });
    return { deleted: true };
  }

  const index = inMemorySavedPlaces.findIndex((place) => place.id === id && place.userId === userId);

  if (index >= 0) {
    inMemorySavedPlaces.splice(index, 1);
  }

  return { deleted: true };
}

module.exports = {
  createSavedPlace,
  deleteSavedPlace,
  listSavedPlaces
};

