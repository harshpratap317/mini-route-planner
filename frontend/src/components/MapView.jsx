import { useEffect } from "react";
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { createLetterIcon, createPlaceIcon } from "../lib/leafletIcons";

function MapCenterController({ center }) {
  const map = useMap();

  useEffect(() => {
    if (!center) {
      return;
    }

    map.setView([center.lat, center.lng], center.zoom || map.getZoom(), {
      animate: true
    });
  }, [center, map]);

  return null;
}

function MapClickHandler({ activeSelection, onMapSelect }) {
  useMapEvents({
    click(event) {
      onMapSelect(activeSelection, event.latlng);
    }
  });

  return null;
}

function MapView({
  center,
  userLocation,
  pickup,
  destination,
  route,
  nearbyPlaces = [],
  activeSelection,
  onMapSelect
}) {
  return (
    <section className="map-card">
      <div className="map-toolbar">
        <span>Map</span>
        <strong>Click sets {activeSelection}</strong>
      </div>

      <div className="map-trip-card">
        <div>
          <span>Pickup</span>
          <strong>{pickup?.label?.split(",")[0] || "Choose pickup"}</strong>
        </div>
        <div>
          <span>Destination</span>
          <strong>{destination?.label?.split(",")[0] || "Choose destination"}</strong>
        </div>
        <div className="map-trip-card__metrics">
          <p>{route ? `${route.distanceKm} km` : "-- km"}</p>
          <p>{route?.etaLabel || "-- min"}</p>
        </div>
      </div>

      <div className="map-shell">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom className="leaflet-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapCenterController center={center} />
          <MapClickHandler activeSelection={activeSelection} onMapSelect={onMapSelect} />

          {userLocation && (
            <>
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={120}
                pathOptions={{ color: "#2563eb", fillColor: "#60a5fa", fillOpacity: 0.25 }}
              />
              <Popup position={[userLocation.lat, userLocation.lng]}>Current location</Popup>
            </>
          )}

          {pickup && (
            <Marker position={[pickup.lat, pickup.lng]} icon={createLetterIcon("P", "pickup")}>
              <Popup>
                <strong>Pickup</strong>
                <br />
                {pickup.label}
              </Popup>
            </Marker>
          )}

          {destination && (
            <Marker
              position={[destination.lat, destination.lng]}
              icon={createLetterIcon("D", "destination")}
            >
              <Popup>
                <strong>Destination</strong>
                <br />
                {destination.label}
              </Popup>
            </Marker>
          )}

          {route?.geometry?.length > 0 && (
            <Polyline
              positions={route.geometry}
              pathOptions={{
                color: "#2563eb",
                opacity: 0.92,
                weight: 6
              }}
            />
          )}

          {nearbyPlaces.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={createPlaceIcon(place.category)}
            >
              <Popup>
                <strong>{place.name}</strong>
                <br />
                {place.category}
                <br />
                {place.distanceKm} km away
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}

export default MapView;
