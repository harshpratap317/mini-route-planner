const PlacesCache = require("../models/PlacesCache");
const createHttpError = require("../utils/httpError");
const { isDatabaseReady } = require("./databaseState");

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const DEFAULT_RADIUS_METERS = 6000;
const MAX_RADIUS_METERS = 12000;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const memoryCache = new Map();

const tagCategories = [
  { key: "tourism", values: ["attraction", "museum", "viewpoint", "zoo", "theme_park"], label: "Tourist attraction" },
  { key: "amenity", values: ["cafe"], label: "Cafe" },
  { key: "amenity", values: ["hospital"], label: "Hospital" },
  { key: "shop", values: ["mall"], label: "Mall" },
  { key: "railway", values: ["station"], label: "Railway station" },
  { key: "aeroway", values: ["aerodrome"], label: "Airport" }
];

function normalizeRadius(radius) {
  const parsedRadius = Number(radius || DEFAULT_RADIUS_METERS);
  return Math.min(MAX_RADIUS_METERS, Math.max(1000, Number.isFinite(parsedRadius) ? parsedRadius : DEFAULT_RADIUS_METERS));
}

function validateCoordinate(value, name) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw createHttpError(`${name} must be a valid number.`, 400);
  }

  return parsed;
}

function createCacheKey(lat, lng, radiusMeters) {
  return `${lat.toFixed(2)}:${lng.toFixed(2)}:${radiusMeters}`;
}

function getDistanceKm(pointA, pointB) {
  const earthRadiusKm = 6371;
  const latDelta = ((pointB.lat - pointA.lat) * Math.PI) / 180;
  const lngDelta = ((pointB.lng - pointA.lng) * Math.PI) / 180;
  const lat1 = (pointA.lat * Math.PI) / 180;
  const lat2 = (pointB.lat * Math.PI) / 180;
  const haversine =
    Math.sin(latDelta / 2) ** 2 + Math.sin(lngDelta / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function getCategory(tags = {}) {
  const match = tagCategories.find((category) => category.values.includes(tags[category.key]));
  return match?.label || "Useful place";
}

function buildOverpassQuery(lat, lng, radiusMeters) {
  const selectors = tagCategories.flatMap((category) =>
    category.values.flatMap((value) => [
      `node(around:${radiusMeters},${lat},${lng})["${category.key}"="${value}"];`,
      `way(around:${radiusMeters},${lat},${lng})["${category.key}"="${value}"];`,
      `relation(around:${radiusMeters},${lat},${lng})["${category.key}"="${value}"];`
    ])
  );

  return `[out:json][timeout:20];(${selectors.join("")});out center tags 30;`;
}

function mapOverpassElement(element, center) {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  const name = element.tags?.name || element.tags?.["name:en"];

  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    id: `${element.type}-${element.id}`,
    name,
    category: getCategory(element.tags),
    lat,
    lng,
    distanceKm: Number(getDistanceKm(center, { lat, lng }).toFixed(2)),
    source: "OpenStreetMap Overpass"
  };
}

function uniqueAndSortPlaces(places) {
  const seen = new Set();

  return places
    .filter(Boolean)
    .filter((place) => {
      const key = `${place.name.toLowerCase()}-${place.lat.toFixed(4)}-${place.lng.toFixed(4)}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 18);
}

async function readCache(cacheKey) {
  const memoryHit = memoryCache.get(cacheKey);

  if (memoryHit && memoryHit.expiresAt > Date.now()) {
    return memoryHit.places;
  }

  if (!isDatabaseReady()) {
    return null;
  }

  const cache = await PlacesCache.findOne({
    cacheKey,
    expiresAt: { $gt: new Date() }
  }).lean();

  return cache?.places || null;
}

async function writeCache(cacheKey, center, radiusMeters, places) {
  memoryCache.set(cacheKey, {
    places,
    expiresAt: Date.now() + CACHE_TTL_MS
  });

  if (!isDatabaseReady()) {
    return;
  }

  await PlacesCache.findOneAndUpdate(
    { cacheKey },
    {
      cacheKey,
      center,
      radiusMeters,
      places,
      expiresAt: new Date(Date.now() + CACHE_TTL_MS)
    },
    { upsert: true, new: true }
  );
}

async function getNearbyPlaces({ lat, lng, radius }) {
  const center = {
    lat: validateCoordinate(lat, "Latitude"),
    lng: validateCoordinate(lng, "Longitude")
  };
  const radiusMeters = normalizeRadius(radius);
  const cacheKey = createCacheKey(center.lat, center.lng, radiusMeters);
  const cachedPlaces = await readCache(cacheKey);

  if (cachedPlaces) {
    return {
      places: cachedPlaces,
      source: "cache",
      radiusMeters
    };
  }

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: new URLSearchParams({
      data: buildOverpassQuery(center.lat, center.lng, radiusMeters)
    })
  });

  if (!response.ok) {
    throw createHttpError("Nearby places service is temporarily unavailable. Please try again.", response.status);
  }

  const data = await response.json();
  const places = uniqueAndSortPlaces((data.elements || []).map((element) => mapOverpassElement(element, center)));

  await writeCache(cacheKey, center, radiusMeters, places);

  return {
    places,
    source: "OpenStreetMap Overpass",
    radiusMeters
  };
}

module.exports = {
  getNearbyPlaces
};

