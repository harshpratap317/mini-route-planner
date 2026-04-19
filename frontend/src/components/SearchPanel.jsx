import { useEffect, useState } from "react";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { searchPlaces } from "../services/api";

function PlaceInput({ label, value, placeholder, active, onFocus, onSelectPlace }) {
  const [query, setQuery] = useState(value?.label || "");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    setQuery(value?.label || "");
  }, [value]);

  useEffect(() => {
    let ignore = false;

    async function runSearch() {
      if (!debouncedQuery || debouncedQuery.trim().length < 3 || debouncedQuery === value?.label) {
        setResults([]);
        setError("");
        return;
      }

      setIsSearching(true);
      setError("");

      try {
        const places = await searchPlaces(debouncedQuery);

        if (!ignore) {
          setResults(places);
        }
      } catch (searchError) {
        if (!ignore) {
          setResults([]);
          setError(searchError.message);
        }
      } finally {
        if (!ignore) {
          setIsSearching(false);
        }
      }
    }

    runSearch();

    return () => {
      ignore = true;
    };
  }, [debouncedQuery, value?.label]);

  function handleSelect(place) {
    onSelectPlace(place);
    setQuery(place.label);
    setResults([]);
  }

  return (
    <label className={`field place-field ${active ? "field--active" : ""}`}>
      <span>{label}</span>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
      />

      {(isSearching || error || results.length > 0) && (
        <div className="suggestions-panel">
          {isSearching && <div className="suggestion-status">Searching...</div>}
          {error && <div className="suggestion-error">{error}</div>}
          {!isSearching &&
            results.map((place) => (
              <button type="button" key={place.id} onClick={() => handleSelect(place)}>
                <strong>{place.label.split(",")[0]}</strong>
                <span>{place.label}</span>
              </button>
            ))}
          {!isSearching && !error && debouncedQuery.trim().length >= 3 && results.length === 0 && (
            <div className="suggestion-status">No matches found</div>
          )}
        </div>
      )}
    </label>
  );
}

function SearchPanel({
  pickup,
  destination,
  activeSelection,
  onUseCurrentLocation,
  onSelectPickupMode,
  onSelectDestinationMode,
  onPickupSelected,
  onDestinationSelected,
  onSwapLocations,
  canUseCurrentLocation,
  onCompareClick,
  isRouteLoading
}) {
  return (
    <section className="search-panel">
      <div className="brand-block">
        <div className="brand-mark">R</div>
        <div>
          <p>RouteIQ India</p>
          <span>Map routes, fares, and nearby places</span>
        </div>
      </div>

      <div className="search-grid">
        <PlaceInput
          label="Pickup"
          value={pickup}
          active={activeSelection === "pickup"}
          onFocus={onSelectPickupMode}
          onSelectPlace={onPickupSelected}
          placeholder="Search pickup"
        />

        <PlaceInput
          label="Destination"
          value={destination}
          active={activeSelection === "destination"}
          onFocus={onSelectDestinationMode}
          onSelectPlace={onDestinationSelected}
          placeholder="Search destination"
        />

        <button className="primary-button" type="button" onClick={onCompareClick} disabled={isRouteLoading}>
          {isRouteLoading ? "Finding..." : "Compare"}
        </button>
      </div>

      <div className="action-row">
        <button
          className="secondary-button"
          type="button"
          onClick={onUseCurrentLocation}
          disabled={!canUseCurrentLocation}
        >
          My location
        </button>
        <button className="secondary-button" type="button" onClick={onSelectPickupMode}>
          Set pickup
        </button>
        <button className="secondary-button" type="button" onClick={onSelectDestinationMode}>
          Set destination
        </button>
        <button className="secondary-button secondary-button--accent" type="button" onClick={onSwapLocations}>
          Swap
        </button>
        <span className="selection-chip">Next click: {activeSelection}</span>
      </div>
    </section>
  );
}

export default SearchPanel;
