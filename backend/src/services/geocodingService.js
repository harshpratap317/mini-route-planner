const createHttpError = require("../utils/httpError");

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

function mapNominatimPlace(place) {
  return {
    id: place.place_id,
    label: place.display_name,
    lat: Number(place.lat),
    lng: Number(place.lon),
    type: place.type,
    category: place.category,
    importance: place.importance
  };
}

async function searchPlaces(query) {
  const trimmedQuery = query?.trim();

  if (!trimmedQuery || trimmedQuery.length < 2) {
    throw createHttpError("Search query must contain at least 2 characters.", 400);
  }

  const params = new URLSearchParams({
    q: trimmedQuery,
    format: "jsonv2",
    addressdetails: "1",
    countrycodes: "in",
    limit: "6"
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`, {
    headers: {
      "User-Agent": "mini-route-planner-portfolio/1.0"
    }
  });

  if (!response.ok) {
    throw createHttpError("Place search failed. Please try again.", response.status);
  }

  const places = await response.json();
  return places.map(mapNominatimPlace);
}

async function reverseGeocode(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw createHttpError("Valid latitude and longitude are required.", 400);
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "jsonv2",
    zoom: "16",
    addressdetails: "1"
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params.toString()}`, {
    headers: {
      "User-Agent": "mini-route-planner-portfolio/1.0"
    }
  });

  if (!response.ok) {
    throw createHttpError("Reverse geocoding failed. Please try again.", response.status);
  }

  const place = await response.json();

  return {
    label: place.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    lat,
    lng
  };
}

module.exports = {
  reverseGeocode,
  searchPlaces
};

