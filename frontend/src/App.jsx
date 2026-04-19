import { useEffect, useMemo, useState } from "react";
import FareComparison from "./components/FareComparison";
import MapView from "./components/MapView";
import NearbyPlaces from "./components/NearbyPlaces";
import RouteDetails from "./components/RouteDetails";
import RouteHistory from "./components/RouteHistory";
import SavedPlaces from "./components/SavedPlaces";
import SearchPanel from "./components/SearchPanel";
import SidebarTabs from "./components/SidebarTabs";
import TripOverview from "./components/TripOverview";
import {
  clearRouteHistory,
  createSavedPlace,
  deleteSavedPlace,
  fetchFareEstimates,
  fetchNearbyPlaces,
  fetchRoute,
  fetchRouteHistory,
  fetchSavedPlaces,
  reverseGeocode,
  saveRouteHistory
} from "./services/api";

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629, zoom: 5 };

function formatCoordinateLabel(label, lat, lng) {
  if (label) {
    return label;
  }

  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function toPoint(place, source = "search") {
  return {
    lat: Number(place.lat),
    lng: Number(place.lng),
    label: place.label,
    source
  };
}

function getCheapestEstimate(estimates) {
  return estimates.find((estimate) => estimate.isCheapest) || estimates[0] || null;
}

function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [fareEstimates, setFareEstimates] = useState([]);
  const [fareDisclaimer, setFareDisclaimer] = useState("");
  const [fareError, setFareError] = useState("");
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [nearbyError, setNearbyError] = useState("");
  const [isNearbyLoading, setIsNearbyLoading] = useState(false);
  const [routeHistory, setRouteHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [savedPlaceError, setSavedPlaceError] = useState("");
  const [isSavedPlaceLoading, setIsSavedPlaceLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(INDIA_CENTER);
  const [activeSelection, setActiveSelection] = useState("destination");
  const [activePanel, setActivePanel] = useState("overview");
  const [statusMessage, setStatusMessage] = useState("Locating...");

  useEffect(() => {
    async function loadHistory() {
      setIsHistoryLoading(true);
      setHistoryError("");

      try {
        setRouteHistory(await fetchRouteHistory());
      } catch (error) {
        setHistoryError(error.message);
      } finally {
        setIsHistoryLoading(false);
      }
    }

    loadHistory();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pLat = Number(params.get("pLat"));
    const pLng = Number(params.get("pLng"));
    const dLat = Number(params.get("dLat"));
    const dLng = Number(params.get("dLng"));

    if ([pLat, pLng, dLat, dLng].every(Number.isFinite)) {
      const sharedPickup = {
        lat: pLat,
        lng: pLng,
        label: params.get("pLabel") || "Shared pickup",
        source: "shared-link"
      };
      const sharedDestination = {
        lat: dLat,
        lng: dLng,
        label: params.get("dLabel") || "Shared destination",
        source: "shared-link"
      };

      setPickup(sharedPickup);
      setDestination(sharedDestination);
      setMapCenter({ lat: dLat, lng: dLng, zoom: 14 });
      setStatusMessage("Shared route loaded.");
    }
  }, []);

  useEffect(() => {
    async function loadSavedPlaces() {
      setIsSavedPlaceLoading(true);
      setSavedPlaceError("");

      try {
        setSavedPlaces(await fetchSavedPlaces());
      } catch (error) {
        setSavedPlaceError(error.message);
      } finally {
        setIsSavedPlaceLoading(false);
      }
    }

    loadSavedPlaces();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatusMessage("Use search or map click.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Current location",
          source: "geolocation"
        };

        setUserLocation(nextLocation);
        setPickup((currentPickup) => {
          if (currentPickup?.source === "shared-link") {
            setStatusMessage("Shared route loaded.");
            return currentPickup;
          }

          setMapCenter({
            lat: nextLocation.lat,
            lng: nextLocation.lng,
            zoom: 14
          });
          setActiveSelection("destination");
          setStatusMessage("Pickup set to current location.");
          return nextLocation;
        });
      },
      (error) => {
        const fallbackMessage =
          error.code === 1
            ? "Location blocked. Use search or map."
            : "Location unavailable. Use search or map.";

        setStatusMessage(fallbackMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  const nearbyAnchor = destination || pickup || userLocation;

  useEffect(() => {
    let ignore = false;

    async function loadNearbyPlaces() {
      if (!nearbyAnchor) {
        return;
      }

      setIsNearbyLoading(true);
      setNearbyError("");

      try {
        const data = await fetchNearbyPlaces({
          lat: nearbyAnchor.lat,
          lng: nearbyAnchor.lng,
          radius: 6000
        });

        if (!ignore) {
          setNearbyPlaces(data.places || []);
        }
      } catch (error) {
        if (!ignore) {
          setNearbyPlaces([]);
          setNearbyError(error.message);
        }
      } finally {
        if (!ignore) {
          setIsNearbyLoading(false);
        }
      }
    }

    loadNearbyPlaces();

    return () => {
      ignore = true;
    };
  }, [nearbyAnchor?.lat, nearbyAnchor?.lng]);

  const summary = useMemo(() => {
    if (route && fareEstimates.length > 0) {
      return `${route.distanceKm} km route with ${fareEstimates.length} ride options.`;
    }

    if (route) {
      return `${route.distanceKm} km - ${route.etaLabel}.`;
    }

    if (pickup && destination) {
      return "Ready to compare.";
    }

    if (pickup) {
      return "Choose a destination.";
    }

    return "Choose pickup and destination.";
  }, [pickup, destination, route, fareEstimates.length]);

  function clearRoute() {
    setRoute(null);
    setRouteError("");
    setFareEstimates([]);
    setFareDisclaimer("");
    setFareError("");
  }

  async function refreshHistory() {
    try {
      setRouteHistory(await fetchRouteHistory());
    } catch (error) {
      setHistoryError(error.message);
    }
  }

  async function createPointFromLatLng(latlng, labelPrefix) {
    const fallbackPoint = {
      lat: latlng.lat,
      lng: latlng.lng,
      label: `${labelPrefix} - ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`,
      source: "map"
    };

    try {
      const place = await reverseGeocode(latlng.lat, latlng.lng);
      return {
        ...fallbackPoint,
        label: place.label || fallbackPoint.label
      };
    } catch {
      return fallbackPoint;
    }
  }

  async function saveSuccessfulRoute(nextPickup, nextDestination, nextRoute, estimates) {
    const cheapestEstimate = getCheapestEstimate(estimates);

    await saveRouteHistory({
      pickup: nextPickup,
      destination: nextDestination,
      distanceKm: nextRoute.distanceKm,
      etaLabel: nextRoute.etaLabel,
      durationMinutes: nextRoute.durationMinutes,
      cheapestProvider: cheapestEstimate?.displayName || "",
      cheapestFare: cheapestEstimate?.estimatedFare || 0
    });

    await refreshHistory();
  }

  async function calculateComparison(nextPickup, nextDestination, options = {}) {
    const shouldSaveHistory = options.saveHistory !== false;

    setIsRouteLoading(true);
    setRouteError("");
    setFareError("");
    setStatusMessage("Finding route...");

    try {
      const nextRoute = await fetchRoute(nextPickup, nextDestination);
      setRoute(nextRoute);
      setStatusMessage("Estimating fares...");

      let estimates = [];

      try {
        const fareData = await fetchFareEstimates({
          route: nextRoute,
          pickup: nextPickup,
          destination: nextDestination
        });

        estimates = fareData.estimates || [];
        setFareEstimates(estimates);
        setFareDisclaimer(fareData.disclaimer || "");
        setStatusMessage("Route ready.");
      } catch (fareEstimateError) {
        setFareEstimates([]);
        setFareError(fareEstimateError.message);
        setStatusMessage("Route ready. Fare estimate failed.");
      }

      if (shouldSaveHistory) {
        await saveSuccessfulRoute(nextPickup, nextDestination, nextRoute, estimates);
      }
    } catch (routeFetchError) {
      setRoute(null);
      setFareEstimates([]);
      setRouteError(routeFetchError.message);
      setStatusMessage("Route not found.");
    } finally {
      setIsRouteLoading(false);
    }
  }

  async function handleMapSelect(selectionType, latlng) {
    setStatusMessage(`Setting ${selectionType}...`);
    const point = await createPointFromLatLng(
      latlng,
      selectionType === "pickup" ? "Pickup point" : "Destination point"
    );

    clearRoute();

    if (selectionType === "pickup") {
      setPickup(point);
      setActiveSelection("destination");
      setStatusMessage("Pickup set.");
    } else {
      setDestination(point);
      setStatusMessage("Destination set.");
    }

    setMapCenter({
      lat: latlng.lat,
      lng: latlng.lng,
      zoom: 14
    });
  }

  function handleUseCurrentLocation() {
    if (!userLocation) {
      setStatusMessage("Location unavailable.");
      return;
    }

    clearRoute();
    setPickup({
      ...userLocation,
      label: formatCoordinateLabel("Current location", userLocation.lat, userLocation.lng)
    });
    setMapCenter({
      lat: userLocation.lat,
      lng: userLocation.lng,
      zoom: 14
    });
    setActiveSelection("destination");
    setStatusMessage("Pickup set to current location.");
  }

  function handlePickupSelected(place) {
    const point = toPoint(place);
    clearRoute();
    setPickup(point);
    setMapCenter({ lat: point.lat, lng: point.lng, zoom: 14 });
    setActiveSelection("destination");
    setStatusMessage("Pickup set.");
  }

  function handleDestinationSelected(place) {
    const point = toPoint(place);
    clearRoute();
    setDestination(point);
    setMapCenter({ lat: point.lat, lng: point.lng, zoom: 14 });
    setStatusMessage("Destination set.");
  }

  function handleSwapLocations() {
    if (!pickup || !destination) {
      setStatusMessage("Set both points first.");
      return;
    }

    clearRoute();
    setPickup(destination);
    setDestination(pickup);
    setMapCenter({ lat: pickup.lat, lng: pickup.lng, zoom: 14 });
    setActiveSelection("destination");
    setStatusMessage("Route swapped.");
  }

  async function handleCompareClick() {
    if (!pickup || !destination) {
      setStatusMessage("Select pickup and destination.");
      return;
    }

    await calculateComparison(pickup, destination);
  }

  async function handleSelectHistory(item) {
    if (!item.pickup || !item.destination) {
      return;
    }

    clearRoute();
    setPickup(item.pickup);
    setDestination(item.destination);
    setMapCenter({ lat: item.destination.lat, lng: item.destination.lng, zoom: 14 });
    setStatusMessage("Loading route...");
    await calculateComparison(item.pickup, item.destination, { saveHistory: false });
  }

  async function handleClearHistory() {
    setIsHistoryLoading(true);
    setHistoryError("");

    try {
      await clearRouteHistory();
      setRouteHistory([]);
      setStatusMessage("History cleared.");
    } catch (error) {
      setHistoryError(error.message);
    } finally {
      setIsHistoryLoading(false);
    }
  }

  function handleFocusPlace(place) {
    setMapCenter({ lat: place.lat, lng: place.lng, zoom: 16 });
    setStatusMessage(place.name);
  }

  async function refreshSavedPlaces() {
    try {
      setSavedPlaces(await fetchSavedPlaces());
    } catch (error) {
      setSavedPlaceError(error.message);
    }
  }

  async function handleSavePoint(point, category) {
    if (!point) {
      setStatusMessage("Nothing to save.");
      return;
    }

    setIsSavedPlaceLoading(true);
    setSavedPlaceError("");

    try {
      await createSavedPlace({
        label: point.label,
        lat: point.lat,
        lng: point.lng,
        category
      });
      await refreshSavedPlaces();
      setStatusMessage(`${category} saved.`);
    } catch (error) {
      setSavedPlaceError(error.message);
    } finally {
      setIsSavedPlaceLoading(false);
    }
  }

  async function handleDeleteSavedPlace(id) {
    setIsSavedPlaceLoading(true);
    setSavedPlaceError("");

    try {
      await deleteSavedPlace(id);
      await refreshSavedPlaces();
      setStatusMessage("Saved place deleted.");
    } catch (error) {
      setSavedPlaceError(error.message);
    } finally {
      setIsSavedPlaceLoading(false);
    }
  }

  function toSavedPoint(place, source = "saved-place") {
    return {
      lat: place.lat,
      lng: place.lng,
      label: place.label,
      source
    };
  }

  function handleUseSavedAsPickup(place) {
    const point = toSavedPoint(place);
    clearRoute();
    setPickup(point);
    setActiveSelection("destination");
    setMapCenter({ lat: point.lat, lng: point.lng, zoom: 14 });
    setStatusMessage("Pickup set from saved place.");
  }

  function handleUseSavedAsDestination(place) {
    const point = toSavedPoint(place);
    clearRoute();
    setDestination(point);
    setMapCenter({ lat: point.lat, lng: point.lng, zoom: 14 });
    setStatusMessage("Destination set from saved place.");
  }

  async function handleShareTrip() {
    if (!pickup || !destination) {
      setStatusMessage("Set both points first.");
      return;
    }

    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("pLat", String(pickup.lat));
    url.searchParams.set("pLng", String(pickup.lng));
    url.searchParams.set("pLabel", pickup.label || "Pickup");
    url.searchParams.set("dLat", String(destination.lat));
    url.searchParams.set("dLng", String(destination.lng));
    url.searchParams.set("dLabel", destination.label || "Destination");

    try {
      await navigator.clipboard.writeText(url.toString());
      setStatusMessage("Trip link copied.");
    } catch {
      window.history.replaceState(null, "", url.toString());
      setStatusMessage("Trip link added to address bar.");
    }
  }

  return (
    <div className="app-shell">
      <div className="container">
        <SearchPanel
          pickup={pickup}
          destination={destination}
          activeSelection={activeSelection}
          onUseCurrentLocation={handleUseCurrentLocation}
          onSelectPickupMode={() => setActiveSelection("pickup")}
          onSelectDestinationMode={() => setActiveSelection("destination")}
          onPickupSelected={handlePickupSelected}
          onDestinationSelected={handleDestinationSelected}
          onSwapLocations={handleSwapLocations}
          canUseCurrentLocation={Boolean(userLocation)}
          onCompareClick={handleCompareClick}
          isRouteLoading={isRouteLoading}
        />

        <div className="content-grid">
          <MapView
            center={mapCenter}
            userLocation={userLocation}
            pickup={pickup}
            destination={destination}
            route={route}
            nearbyPlaces={nearbyPlaces}
            activeSelection={activeSelection}
            onMapSelect={handleMapSelect}
          />

          <aside className="sidebar">
            <SidebarTabs activeTab={activePanel} onTabChange={setActivePanel} />

            {activePanel === "overview" && (
              <>
                <TripOverview
                  pickup={pickup}
                  destination={destination}
                  route={route}
                  fareEstimates={fareEstimates}
                  nearbyCount={nearbyPlaces.length}
                  statusMessage={statusMessage}
                  onShareTrip={handleShareTrip}
                />
                <RouteDetails
                  route={route}
                  loading={isRouteLoading}
                  error={routeError}
                  pickup={pickup}
                  destination={destination}
                />
                <section className="card status-card">
                  <p className="eyebrow">Status</p>
                  <h2>Trip state</h2>
                  <p>{statusMessage}</p>
                  <div className="status-card__summary">{summary}</div>
                </section>
              </>
            )}

            {activePanel === "rides" && (
              <FareComparison
                estimates={fareEstimates}
                loading={isRouteLoading}
                error={fareError}
                disclaimer={fareDisclaimer}
              />
            )}

            {activePanel === "explore" && (
              <NearbyPlaces
                places={nearbyPlaces}
                loading={isNearbyLoading}
                error={nearbyError}
                onFocusPlace={handleFocusPlace}
              />
            )}

            {activePanel === "saved" && (
              <SavedPlaces
                pickup={pickup}
                destination={destination}
                places={savedPlaces}
                loading={isSavedPlaceLoading}
                error={savedPlaceError}
                onSavePickup={() => handleSavePoint(pickup, "Pickup")}
                onSaveDestination={() => handleSavePoint(destination, "Destination")}
                onUseAsPickup={handleUseSavedAsPickup}
                onUseAsDestination={handleUseSavedAsDestination}
                onDeletePlace={handleDeleteSavedPlace}
              />
            )}

            {activePanel === "history" && (
              <RouteHistory
                history={routeHistory}
                loading={isHistoryLoading}
                error={historyError}
                onSelectHistory={handleSelectHistory}
                onClearHistory={handleClearHistory}
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
