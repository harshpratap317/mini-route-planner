function TripOverview({ pickup, destination, route, fareEstimates, nearbyCount, statusMessage, onShareTrip }) {
  const cheapest = fareEstimates.find((estimate) => estimate.isCheapest) || fareEstimates[0];
  const fastest = fareEstimates.find((estimate) => estimate.isFastest);

  return (
    <section className="card overview-card">
      <p className="eyebrow">Overview</p>
      <h2>Trip dashboard</h2>

      <div className="trip-points">
        <div>
          <span className="point-dot point-dot--pickup" />
          <p>{pickup?.label?.split(",")[0] || "Pickup not set"}</p>
        </div>
        <div>
          <span className="point-dot point-dot--destination" />
          <p>{destination?.label?.split(",")[0] || "Destination not set"}</p>
        </div>
      </div>

      <div className="insight-grid">
        <div>
          <span>Distance</span>
          <strong>{route ? `${route.distanceKm} km` : "--"}</strong>
        </div>
        <div>
          <span>ETA</span>
          <strong>{route?.etaLabel || "--"}</strong>
        </div>
        <div>
          <span>Best fare</span>
          <strong>{cheapest?.estimatedFareLabel || "--"}</strong>
        </div>
        <div>
          <span>Fastest</span>
          <strong>{fastest?.estimatedArrivalLabel || "--"}</strong>
        </div>
      </div>

      <div className="overview-footer">
        <span>{nearbyCount} nearby places</span>
        <strong>{statusMessage}</strong>
      </div>

      <button className="share-button" type="button" onClick={onShareTrip} disabled={!pickup || !destination}>
        Share trip link
      </button>
    </section>
  );
}

export default TripOverview;
