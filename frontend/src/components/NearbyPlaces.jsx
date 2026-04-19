import { useMemo, useState } from "react";

function NearbyPlaces({ places, loading, error, onFocusPlace }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = useMemo(() => ["All", ...new Set(places.map((place) => place.category))], [places]);
  const visiblePlaces = useMemo(() => {
    return activeCategory === "All"
      ? places
      : places.filter((place) => place.category === activeCategory);
  }, [activeCategory, places]);

  return (
    <section className="card nearby-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Explore</p>
          <h2>Nearby</h2>
        </div>
        <span className="estimate-pill">OSM</span>
      </div>

      {loading && <p className="muted-text">Loading places...</p>}

      {!loading && error && <p className="error-text">{error}</p>}

      {!loading && !error && places.length === 0 && <p className="muted-text">No places found nearby.</p>}

      {!loading && !error && places.length > 0 && (
        <>
          <div className="control-row control-row--wrap">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={activeCategory === category ? "filter-chip filter-chip--active" : "filter-chip"}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="nearby-list">
            {visiblePlaces.map((place) => (
              <button type="button" key={place.id} onClick={() => onFocusPlace(place)}>
                <div>
                  <strong>{place.name}</strong>
                  <span>{place.category}</span>
                </div>
                <small>{place.distanceKm} km</small>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default NearbyPlaces;
