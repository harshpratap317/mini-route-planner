function RouteHistory({ history, loading, error, onSelectHistory, onClearHistory }) {
  return (
    <section className="card history-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Recent</p>
          <h2>History</h2>
        </div>
        <button className="text-button" type="button" onClick={onClearHistory} disabled={loading || history.length === 0}>
          Clear
        </button>
      </div>

      {loading && <p className="muted-text">Loading...</p>}

      {!loading && error && <p className="error-text">{error}</p>}

      {!loading && !error && history.length === 0 && <p className="muted-text">No recent routes.</p>}

      {!loading && !error && history.length > 0 && (
        <div className="history-list">
          {history.map((item) => (
            <button type="button" key={item.id} onClick={() => onSelectHistory(item)}>
              <strong>{item.pickup?.label?.split(",")[0] || "Pickup"}</strong>
              <span>{item.destination?.label?.split(",")[0] || "Destination"}</span>
              <small>
                {item.distanceKm} km - {item.etaLabel}
                {item.cheapestFare ? ` - from Rs ${item.cheapestFare}` : ""}
              </small>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default RouteHistory;

