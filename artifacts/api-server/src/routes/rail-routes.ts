import { Router } from "express";
import { STATIONS } from "../data/stations";
import { findRoutes, sortByDuration } from "../data/timetable";
import { ACTIVE_DISRUPTIONS } from "../data/disruptions";

const router = Router();

function resolveStation(query: string) {
  const q = query.toLowerCase().trim();
  return STATIONS.find(
    (s) =>
      s.id === q ||
      s.code.toLowerCase() === q ||
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
  );
}

// GET /routes/search?from=X&to=Y&date=Z
router.get("/routes/search", (req, res) => {
  const { from, to, date } = req.query as Record<string, string>;

  if (!from || !to) {
    res.status(400).json({ error: "Both 'from' and 'to' query parameters are required." });
    return;
  }

  const fromStation = resolveStation(from);
  const toStation = resolveStation(to);

  if (!fromStation) {
    res.status(400).json({ error: `Station not found: "${from}". Use /api/stations for the full list.` });
    return;
  }
  if (!toStation) {
    res.status(400).json({ error: `Station not found: "${to}". Use /api/stations for the full list.` });
    return;
  }
  if (fromStation.id === toStation.id) {
    res.status(400).json({ error: "Origin and destination must be different stations." });
    return;
  }

  const travelDate = date ? new Date(date) : new Date();
  if (isNaN(travelDate.getTime())) {
    res.status(400).json({ error: `Invalid date format: "${date}". Use ISO 8601.` });
    return;
  }

  req.log.info({ from: fromStation.id, to: toStation.id, date: travelDate.toISOString() }, "Searching routes");

  const routes = findRoutes(fromStation.id, toStation.id, travelDate);
  const sorted = sortByDuration(routes);

  if (sorted.length === 0) {
    res.status(404).json({ error: `No direct routes found between ${fromStation.name} and ${toStation.name}.` });
    return;
  }

  const [fastest, ...alternatives] = sorted;

  res.json({
    fastest,
    alternatives,
    dataSource: "static-fallback",
    searchedAt: new Date().toISOString(),
  });
});

// GET /routes/alternatives?from=X&to=Y
router.get("/routes/alternatives", (req, res) => {
  const { from, to } = req.query as Record<string, string>;

  if (!from || !to) {
    res.status(400).json({ error: "Both 'from' and 'to' query parameters are required." });
    return;
  }

  const fromStation = resolveStation(from);
  const toStation = resolveStation(to);

  if (!fromStation || !toStation) {
    res.status(400).json({ error: "One or both stations not found." });
    return;
  }

  const routes = sortByDuration(findRoutes(fromStation.id, toStation.id, new Date()));
  const alternatives = routes.slice(1); // exclude the fastest
  res.json(alternatives);
});

// GET /status
router.get("/status", (_req, res) => {
  // Attempt to represent the external data sources
  const dataSources = [
    {
      name: "NRC Live API (nrc.tps.ng)",
      available: false,
      lastChecked: new Date().toISOString(),
      latencyMs: null,
    },
    {
      name: "FindTrain API (findtrain.com)",
      available: false,
      lastChecked: new Date().toISOString(),
      latencyMs: null,
    },
    {
      name: "TrainsTracking NG (trainstracking.com)",
      available: false,
      lastChecked: new Date().toISOString(),
      latencyMs: null,
    },
    {
      name: "Static Timetable (Fallback)",
      available: true,
      lastChecked: new Date().toISOString(),
      latencyMs: 0,
    },
  ];

  res.json({
    dataSources,
    activeDisruptions: ACTIVE_DISRUPTIONS,
    overallStatus: "degraded", // live APIs unavailable, falling back to static
  });
});

export default router;
