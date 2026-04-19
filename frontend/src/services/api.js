const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed. Please try again.");
  }

  return data;
}

export async function searchPlaces(query) {
  const params = new URLSearchParams({ q: query });
  const data = await requestJson(`/api/geocode/search?${params.toString()}`);
  return data.places || [];
}

export async function reverseGeocode(lat, lng) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng)
  });
  const data = await requestJson(`/api/geocode/reverse?${params.toString()}`);
  return data.place;
}

export async function fetchRoute(pickup, destination) {
  const data = await requestJson("/api/routes", {
    method: "POST",
    body: JSON.stringify({ pickup, destination })
  });
  return data.route;
}

export async function fetchFareEstimates({ route, pickup, destination }) {
  const data = await requestJson("/api/fares/estimate", {
    method: "POST",
    body: JSON.stringify({
      distanceKm: route.distanceKm,
      durationMinutes: route.durationMinutes,
      pickup,
      destination
    })
  });

  return data;
}

export async function fetchNearbyPlaces({ lat, lng, radius = 6000 }) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius)
  });
  return requestJson(`/api/places/nearby?${params.toString()}`);
}

export async function fetchRouteHistory() {
  const data = await requestJson("/api/history");
  return data.history || [];
}

export async function saveRouteHistory(payload) {
  const data = await requestJson("/api/history", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.item;
}

export async function clearRouteHistory() {
  return requestJson("/api/history", {
    method: "DELETE"
  });
}

export async function fetchSavedPlaces() {
  const data = await requestJson("/api/saved-places");
  return data.places || [];
}

export async function createSavedPlace(place) {
  const data = await requestJson("/api/saved-places", {
    method: "POST",
    body: JSON.stringify(place)
  });

  return data.place;
}

export async function deleteSavedPlace(id) {
  return requestJson(`/api/saved-places/${id}`, {
    method: "DELETE"
  });
}
