const createHttpError = require("../utils/httpError");

const providerCatalog = [
  {
    provider: "Uber",
    category: "Auto",
    displayName: "Uber Auto",
    baseFare: 35,
    perKmRate: 14,
    perMinuteRate: 1.2,
    surgeMultiplier: 1.08,
    pickupWaitMinutes: 4,
    durationMultiplier: 1.05,
    websiteUrl: "https://www.uber.com/in/en/",
    accentColor: "#111827"
  },
  {
    provider: "Uber",
    category: "Mini",
    displayName: "Uber Go",
    baseFare: 55,
    perKmRate: 18,
    perMinuteRate: 1.8,
    surgeMultiplier: 1.12,
    pickupWaitMinutes: 5,
    durationMultiplier: 1.02,
    websiteUrl: "https://www.uber.com/in/en/",
    accentColor: "#111827"
  },
  {
    provider: "Uber",
    category: "Sedan",
    displayName: "Uber Premier",
    baseFare: 80,
    perKmRate: 25,
    perMinuteRate: 2.4,
    surgeMultiplier: 1.15,
    pickupWaitMinutes: 7,
    durationMultiplier: 1,
    websiteUrl: "https://www.uber.com/in/en/",
    accentColor: "#111827"
  },
  {
    provider: "Ola",
    category: "Bike",
    displayName: "Ola Bike",
    baseFare: 25,
    perKmRate: 9,
    perMinuteRate: 0.8,
    surgeMultiplier: 1.05,
    pickupWaitMinutes: 4,
    durationMultiplier: 0.82,
    websiteUrl: "https://www.olacabs.com/",
    accentColor: "#16a34a"
  },
  {
    provider: "Ola",
    category: "Auto",
    displayName: "Ola Auto",
    baseFare: 30,
    perKmRate: 13,
    perMinuteRate: 1.1,
    surgeMultiplier: 1.06,
    pickupWaitMinutes: 5,
    durationMultiplier: 1.04,
    websiteUrl: "https://www.olacabs.com/",
    accentColor: "#16a34a"
  },
  {
    provider: "Ola",
    category: "Mini",
    displayName: "Ola Mini",
    baseFare: 50,
    perKmRate: 17,
    perMinuteRate: 1.7,
    surgeMultiplier: 1.1,
    pickupWaitMinutes: 6,
    durationMultiplier: 1.03,
    websiteUrl: "https://www.olacabs.com/",
    accentColor: "#16a34a"
  },
  {
    provider: "Ola",
    category: "Sedan",
    displayName: "Ola Prime Sedan",
    baseFare: 75,
    perKmRate: 24,
    perMinuteRate: 2.3,
    surgeMultiplier: 1.12,
    pickupWaitMinutes: 7,
    durationMultiplier: 1,
    websiteUrl: "https://www.olacabs.com/",
    accentColor: "#16a34a"
  },
  {
    provider: "Rapido",
    category: "Bike",
    displayName: "Rapido Bike",
    baseFare: 20,
    perKmRate: 8,
    perMinuteRate: 0.7,
    surgeMultiplier: 1.04,
    pickupWaitMinutes: 3,
    durationMultiplier: 0.78,
    websiteUrl: "https://www.rapido.bike/",
    accentColor: "#f59e0b"
  },
  {
    provider: "Rapido",
    category: "Auto",
    displayName: "Rapido Auto",
    baseFare: 28,
    perKmRate: 12,
    perMinuteRate: 1,
    surgeMultiplier: 1.05,
    pickupWaitMinutes: 4,
    durationMultiplier: 1.03,
    websiteUrl: "https://www.rapido.bike/",
    accentColor: "#f59e0b"
  },
  {
    provider: "Namma Yatri",
    category: "Auto",
    displayName: "Namma Yatri Auto",
    baseFare: 30,
    perKmRate: 12,
    perMinuteRate: 0.9,
    surgeMultiplier: 1,
    pickupWaitMinutes: 5,
    durationMultiplier: 1.06,
    websiteUrl: "https://www.nammayatri.in/",
    accentColor: "#0ea5e9"
  }
];

function validateFareInput(distanceKm, durationMinutes) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    throw createHttpError("A valid route distance is required for fare estimation.", 400);
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    throw createHttpError("A valid route duration is required for fare estimation.", 400);
  }
}

function roundToNearestFive(amount) {
  return Math.max(20, Math.round(amount / 5) * 5);
}

function createUberDeepLink(pickup, destination) {
  if (!pickup || !destination) {
    return "https://www.uber.com/in/en/";
  }

  const params = new URLSearchParams({
    action: "setPickup",
    "pickup[latitude]": String(pickup.lat),
    "pickup[longitude]": String(pickup.lng),
    "dropoff[latitude]": String(destination.lat),
    "dropoff[longitude]": String(destination.lng),
    "dropoff[nickname]": destination.label || "Destination"
  });

  return `https://m.uber.com/ul/?${params.toString()}`;
}

function getProviderRedirectUrl(rule, pickup, destination) {
  if (rule.provider === "Uber") {
    return createUberDeepLink(pickup, destination);
  }

  return rule.websiteUrl;
}

function estimateFares({ distanceKm, durationMinutes, pickup, destination }) {
  validateFareInput(distanceKm, durationMinutes);

  const estimates = providerCatalog
    .map((rule) => {
      const rawFare =
        (rule.baseFare + distanceKm * rule.perKmRate + durationMinutes * rule.perMinuteRate) *
        rule.surgeMultiplier;
      const estimatedFare = roundToNearestFive(rawFare);
      const estimatedArrivalMinutes = Math.max(
        2,
        Math.round(durationMinutes * rule.durationMultiplier + rule.pickupWaitMinutes)
      );

      return {
        id: `${rule.provider}-${rule.category}`.toLowerCase().replace(/\s+/g, "-"),
        provider: rule.provider,
        category: rule.category,
        displayName: rule.displayName,
        estimatedFare,
        estimatedFareLabel: `₹${estimatedFare}`,
        estimatedArrivalMinutes,
        estimatedArrivalLabel: `${estimatedArrivalMinutes} min`,
        baseFare: rule.baseFare,
        perKmRate: rule.perKmRate,
        perMinuteRate: rule.perMinuteRate,
        surgeMultiplier: rule.surgeMultiplier,
        redirectUrl: getProviderRedirectUrl(rule, pickup, destination),
        accentColor: rule.accentColor,
        disclaimer: "Demo estimate only. Not an official live fare."
      };
    })
    .sort((a, b) => a.estimatedFare - b.estimatedFare);

  const cheapestFare = Math.min(...estimates.map((estimate) => estimate.estimatedFare));
  const fastestArrival = Math.min(...estimates.map((estimate) => estimate.estimatedArrivalMinutes));

  return estimates.map((estimate) => ({
    ...estimate,
    isCheapest: estimate.estimatedFare === cheapestFare,
    isFastest: estimate.estimatedArrivalMinutes === fastestArrival
  }));
}

module.exports = {
  estimateFares
};

