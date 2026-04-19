function RouteDetails({ route, loading, error, pickup, destination }) {
  return (
    <section className="card route-details-card">
      <p className="eyebrow">Trip</p>
      <h2>Route</h2>

      {loading && <p className="muted-text">Finding route...</p>}

      {!loading && error && <p className="error-text">{error}</p>}

      {!loading && !error && route && (
        <>
          <div className="route-metrics">
            <div>
              <span>Distance</span>
              <strong>{route.distanceKm} km</strong>
            </div>
            <div>
              <span>ETA</span>
              <strong>{route.etaLabel}</strong>
            </div>
          </div>
          <p className="compact-note">Traffic may change actual arrival time.</p>
        </>
      )}

      {!loading && !error && !route && (
        <p className="muted-text">
          {pickup && destination ? "Tap Compare to calculate." : "Choose pickup and destination."}
        </p>
      )}
    </section>
  );
}

export default RouteDetails;

