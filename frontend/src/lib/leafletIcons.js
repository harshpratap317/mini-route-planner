import L from "leaflet";

export function createLetterIcon(letter, variant) {
  return L.divIcon({
    className: "custom-marker-wrapper",
    html: `<div class="custom-marker custom-marker--${variant}"><span>${letter}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30]
  });
}

export function createPlaceIcon(category = "place") {
  const shortLabel = category
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return L.divIcon({
    className: "place-marker-wrapper",
    html: `<div class="place-marker"><span>${shortLabel}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
}
