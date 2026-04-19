# Mini Route Planner

Portfolio-ready full-stack route planner and ride comparison app for India.

## Final Architecture

### Frontend
- React + Vite
- React Leaflet + OpenStreetMap tiles
- Component-driven UI
- Local React state for the MVP

### Backend
- Node.js + Express REST API
- MongoDB via Mongoose when `MONGODB_URI` is configured
- In-memory fallback for route history and places cache when MongoDB is not configured
- Environment-based configuration
- Geocoding, routing, fare estimates, nearby places, and history endpoints

### Data + integrations
- Real browser geolocation
- Real OpenStreetMap map tiles
- MongoDB persistence scaffolded now, used fully in later phases
- Honest demo fare engine planned for later phases where official provider pricing APIs are unavailable

## Folder Structure

```text
mini-route-planner/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |   `-- db.js
|   |   |-- models/
|   |   |   |-- FareRule.js
|   |   |   |-- PlacesCache.js
|   |   |   |-- SavedPlace.js
|   |   |   |-- SearchHistory.js
|   |   |   `-- User.js
|   |   |-- routes/
|   |   |   |-- fareRoutes.js
|   |   |   |-- geocodeRoutes.js
|   |   |   |-- historyRoutes.js
|   |   |   |-- healthRoutes.js
|   |   |   |-- placesRoutes.js
|   |   |   `-- routeRoutes.js
|   |   |-- services/
|   |   |   |-- databaseState.js
|   |   |   |-- fareService.js
|   |   |   |-- geocodingService.js
|   |   |   |-- historyService.js
|   |   |   |-- placesService.js
|   |   |   `-- routingService.js
|   |   |-- utils/
|   |   |   `-- httpError.js
|   |   |-- app.js
|   |   `-- server.js
|   |-- .env.example
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |   |-- FareComparison.jsx
|   |   |   |-- MapView.jsx
|   |   |   |-- NearbyPlaces.jsx
|   |   |   |-- RouteDetails.jsx
|   |   |   |-- RouteHistory.jsx
|   |   |   `-- SearchPanel.jsx
|   |   |-- hooks/
|   |   |   `-- useDebouncedValue.js
|   |   |-- lib/
|   |   |   `-- leafletIcons.js
|   |   |-- services/
|   |   |   `-- api.js
|   |   |-- App.jsx
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- .env.example
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- .gitignore
|-- package.json
`-- README.md
```

## Package Installation Commands

Run these from the project root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

## Recommended Environment

- Node.js `18.18+` or `20+`
- MongoDB local instance or Atlas connection string for later phases

## Version Compatibility Notes

- `react-leaflet@4` is paired here with React 18 to avoid common peer dependency issues.
- If your local machine already defaults to a newer Vite-compatible Node version, this setup should still work.
- MongoDB is optional for Phase 1. The backend starts even if `MONGODB_URI` is missing.

## Completed MVP Scope

The app is now complete across the requested phases and includes:
- live map
- browser geolocation request on load
- top pickup and destination search bars
- map click selection
- pickup and destination markers
- Express backend scaffold
- place-name search through OpenStreetMap/Nominatim
- reverse geocoding for map clicks
- route rendering through OSRM public demo routing
- distance and ETA display
- estimated fare cards for Bike, Auto, Mini, and Sedan ride types
- provider-branded demo cards for Uber, Ola, Rapido, and Namma Yatri
- cheapest and fastest badges
- provider redirect links
- nearby famous/useful places through OpenStreetMap Overpass
- route history
- clear history button
- MongoDB-ready models for users, search history, saved places, fare rules, and places cache
- local in-memory fallback so the demo still runs without MongoDB

## API Notes

- Place search uses OpenStreetMap Nominatim through the backend at `/api/geocode/search`.
- Map click reverse geocoding uses Nominatim through `/api/geocode/reverse`.
- Routing uses the public OSRM demo service through `/api/routes`.
- Fare comparison uses local demo rules through `/api/fares/estimate`.
- Nearby places use OpenStreetMap Overpass through `/api/places/nearby`.
- Route history uses `/api/history` and persists to MongoDB when `MONGODB_URI` is configured.
- Provider cards are clearly labelled as estimated/demo fares, not official live prices.
- These services are suitable for an MVP/interview demo, but production apps should use a dedicated paid quota/API plan and respect each provider's usage policy.

## Run Locally

1. Install packages.
2. Copy environment files:

```bash
copy backend\\.env.example backend\\.env
copy frontend\\.env.example frontend\\.env
```

3. Start both apps:

```bash
npm run dev
```

4. Open the frontend URL shown by Vite, usually:

```text
http://localhost:5173
```

5. Backend health check:

```text
http://localhost:5000/api/health
```

## Phase 1 Test Checklist

- Allow geolocation in the browser.
- Confirm the map centers on your current location.
- Confirm pickup autofills with current location when permission is granted.
- Click `Set pickup on map` and click anywhere on the map.
- Click `Set destination on map` and click anywhere on the map.
- Confirm both markers appear.
- Search for places such as `Connaught Place Delhi` and `India Gate Delhi`.
- Select pickup and destination from search results.
- Click `Compare rides`.
- Confirm the route line, distance, and ETA appear.
- Confirm estimated fare cards appear with cheapest and fastest badges.
- Click a provider card and confirm it opens that provider's website or best-effort booking link.
- Confirm nearby places appear in the panel and as map markers.
- Confirm recent routes appear in history after comparing.
- Click a history item to reload that route.
- Click `Clear` in the history card to clear recent route searches.

## MongoDB Persistence

MongoDB is optional for the local demo.

If `backend/.env` has `MONGODB_URI`, route history and places cache use MongoDB. If it is empty, the app uses in-memory storage so local development still works.

Suggested Atlas/local URI:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/mini-route-planner
```

## Deployment Prep

For deployment, build the frontend and run the backend separately:

```bash
npm run build --prefix frontend
npm run start --prefix backend
```

Recommended production environment variables:

```bash
PORT=5000
CLIENT_URL=https://your-frontend-domain.example
MONGODB_URI=your-mongodb-atlas-uri
VITE_API_BASE_URL=https://your-backend-domain.example
```

## Common Errors and Fixes

### Map tiles do not appear
- Check internet access.
- Confirm the browser is not blocking OpenStreetMap tile requests.

### Geolocation fails
- Allow location permission in the browser.
- If testing on an insecure origin, use `localhost` instead of a LAN IP.

### `react-leaflet` install error
- Use the package versions already provided in `frontend/package.json`.
- If you installed mismatched versions manually, remove `node_modules` and reinstall.

### MongoDB connection warning
- Safe to ignore in Phase 1.
- Add `MONGODB_URI` later when enabling history persistence.

### `npm` says it cannot find `AppData\\Roaming\\npm\\node_modules\\npm\\bin\\npm-cli.js`
- This is a machine-level npm wrapper issue, not a project code issue.
- Reinstall Node.js, or run npm via the direct CLI path:

```bash
"C:\\Program Files\\nodejs\\node.exe" "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js" install
```
