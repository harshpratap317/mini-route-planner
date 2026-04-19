const createHttpError = require("../utils/httpError");

const OSRM_BASE_URL = "https://router.project-osrm.org";

function validateCoordinate(point, name) {
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
    throw createHttpError(`${name} must include valid lat and lng values.`, 400);
  }
}

function formatDuration(minutes) {
  if (minutes < 60) {
    return `${Math.max(1, Math.round(minutes))} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

async function getRoute({ pickup, destination }) {
  validateCoordinate(pickup, "Pickup");
  validateCoordinate(destination, "Destination");

  const coordinates = `${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}`;
  const params = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    alternatives: "false",
    steps: "false"
  });

  const response = await fetch(`${OSRM_BASE_URL}/route/v1/driving/${coordinates}?${params.toString()}`);

  if (!response.ok) {
    throw createHttpError("Route service failed. Please try another route.", response.status);
  }

  const data = await response.json();
  const route = data.routes?.[0];

  if (!route) {
    throw createHttpError("No route found between the selected points.", 404);
  }

  const distanceKm = route.distance / 1000;
  const durationMinutes = route.duration / 60;
  const geometry = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    durationMinutes: Math.max(1, Math.round(durationMinutes)),
    etaLabel: formatDuration(durationMinutes),
    geometry,
    source: "OSRM public demo routing service"
  };
}

module.exports = {
  getRoute
};

