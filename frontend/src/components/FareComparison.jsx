import { useMemo, useState } from "react";

const sortOptions = [
  { id: "recommended", label: "Recommended" },
  { id: "cheapest", label: "Cheapest" },
  { id: "fastest", label: "Fastest" }
];

function FareComparison({ estimates, loading, error, disclaimer }) {
  const [sortBy, setSortBy] = useState("recommended");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    return ["All", ...new Set(estimates.map((estimate) => estimate.category))];
  }, [estimates]);

  const visibleEstimates = useMemo(() => {
    const filtered =
      category === "All" ? estimates : estimates.filter((estimate) => estimate.category === category);

    return [...filtered].sort((a, b) => {
      if (sortBy === "cheapest") {
        return a.estimatedFare - b.estimatedFare;
      }

      if (sortBy === "fastest") {
        return a.estimatedArrivalMinutes - b.estimatedArrivalMinutes;
      }

      return Number(b.isCheapest) + Number(b.isFastest) - (Number(a.isCheapest) + Number(a.isFastest));
    });
  }, [category, estimates, sortBy]);

  return (
    <section className="card fare-card">
      <div className="fare-card__header">
        <div>
          <p className="eyebrow">Fares</p>
          <h2>Compare rides</h2>
        </div>
        <span className="estimate-pill">Estimate</span>
      </div>

      {loading && <p className="muted-text">Estimating fares...</p>}

      {!loading && error && <p className="error-text">{error}</p>}

      {!loading && !error && estimates.length === 0 && (
        <p className="muted-text">Fare options appear after route search.</p>
      )}

      {!loading && !error && estimates.length > 0 && (
        <>
          <div className="control-row">
            {sortOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                className={sortBy === option.id ? "filter-chip filter-chip--active" : "filter-chip"}
                onClick={() => setSortBy(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="control-row control-row--wrap">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className={category === item ? "filter-chip filter-chip--active" : "filter-chip"}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <p className="fare-disclaimer">{disclaimer || "Demo estimates, not official live fares."}</p>
          <div className="fare-list">
            {visibleEstimates.map((estimate) => (
              <a
                className="fare-option"
                href={estimate.redirectUrl}
                key={estimate.id}
                rel="noreferrer"
                style={{ "--provider-color": estimate.accentColor }}
                target="_blank"
                title={`Open ${estimate.provider}`}
              >
                <div className="fare-option__top">
                  <div>
                    <strong>{estimate.displayName}</strong>
                    <span>{estimate.category}</span>
                  </div>
                  <div className="fare-option__price">{estimate.estimatedFareLabel}</div>
                </div>

                <div className="fare-option__meta">
                  <span>{estimate.estimatedArrivalLabel}</span>
                  <span>x{estimate.surgeMultiplier}</span>
                </div>

                <div className="fare-option__badges">
                  {estimate.isCheapest && <span className="success-badge">Cheapest</span>}
                  {estimate.isFastest && <span className="info-badge">Fastest</span>}
                  <span className="neutral-badge">Est.</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default FareComparison;

