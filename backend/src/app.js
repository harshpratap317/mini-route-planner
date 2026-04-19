const cors = require("cors");
const express = require("express");

const fareRoutes = require("./routes/fareRoutes");
const geocodeRoutes = require("./routes/geocodeRoutes");
const historyRoutes = require("./routes/historyRoutes");
const healthRoutes = require("./routes/healthRoutes");
const placesRoutes = require("./routes/placesRoutes");
const routeRoutes = require("./routes/routeRoutes");
const savedPlaceRoutes = require("./routes/savedPlaceRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Mini Route Planner API",
    message: "Backend is running with geocoding, routing, estimated fares, nearby places, and history APIs."
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/geocode", geocodeRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/fares", fareRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/saved-places", savedPlaceRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found."
  });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || "Unexpected server error.",
    details: error.details || null
  });
});

module.exports = app;
