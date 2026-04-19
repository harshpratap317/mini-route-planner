function SavedPlaces({
  pickup,
  destination,
  places,
  loading,
  error,
  onSavePickup,
  onSaveDestination,
  onUseAsPickup,
  onUseAsDestination,
  onDeletePlace
}) {
  return (
    <section className="card saved-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Saved</p>
          <h2>Places</h2>
        </div>
        <span className="estimate-pill">{places.length}</span>
      </div>

      <div className="saved-actions">
        <button type="button" onClick={onSavePickup} disabled={!pickup || loading}>
          Save pickup
        </button>
        <button type="button" onClick={onSaveDestination} disabled={!destination || loading}>
          Save destination
        </button>
      </div>

      {loading && <p className="muted-text">Loading...</p>}

      {!loading && error && <p className="error-text">{error}</p>}

      {!loading && !error && places.length === 0 && <p className="muted-text">No saved places yet.</p>}

      {!loading && !error && places.length > 0 && (
        <div className="saved-list">
          {places.map((place) => (
            <article key={place.id} className="saved-place">
              <div>
                <strong>{place.label?.split(",")[0]}</strong>
                <span>{place.category}</span>
              </div>

              <div className="saved-place__actions">
                <button type="button" onClick={() => onUseAsPickup(place)}>
                  Pickup
                </button>
                <button type="button" onClick={() => onUseAsDestination(place)}>
                  Drop
                </button>
                <button type="button" className="danger-action" onClick={() => onDeletePlace(place.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default SavedPlaces;
