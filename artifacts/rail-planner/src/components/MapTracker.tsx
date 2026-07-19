import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2, AlertCircle, Layers, Eye, EyeOff, ChevronDown, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LiveTrain } from "@/hooks/useLiveTrains";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const STATION_COORDS: Record<string, [number, number]> = {
  iddo: [6.4698, 3.3852],
  "ebute-metta": [6.4833, 3.3667],
  agege: [6.6167, 3.3167],
  iju: [6.6333, 3.2833],
  agbado: [6.6667, 3.2167],
  abeokuta: [7.1557, 3.3451],
  ibadan: [7.3775, 3.9470],
  offa: [8.1500, 4.7167],
  ilorin: [8.4966, 4.5426],
  jebba: [9.1333, 4.8167],
  minna: [9.6139, 6.5569],
  kaduna: [10.5264, 7.4382],
  zaria: [11.0667, 7.7000],
  kano: [12.0022, 8.5920],
  idu: [9.0333, 7.4167],
  rigachikun: [10.6167, 7.3167],
  "ph-port-harcourt": [4.8156, 7.0498],
  aba: [5.1066, 7.3667],
  enugu: [6.4584, 7.5464],
  makurdi: [7.7333, 8.5333],
  warri: [5.5167, 5.7500],
  sapele: [5.8833, 5.6833],
  "benin-city": [6.3350, 5.6037],
  apapa: [6.4500, 3.3667],
};

const ZOOM_PRESETS = [
  { label: "All Nigeria", center: [9.082, 8.6753] as [number, number], zoom: 6 },
  { label: "Lagos", center: [6.5244, 3.3792] as [number, number], zoom: 11 },
  { label: "Abuja", center: [9.0579, 7.4951] as [number, number], zoom: 11 },
  { label: "Kano", center: [12.0022, 8.5920] as [number, number], zoom: 11 },
  { label: "Port Harcourt", center: [4.8156, 7.0498] as [number, number], zoom: 11 },
  { label: "Ibadan", center: [7.3775, 3.9470] as [number, number], zoom: 11 },
  { label: "Kaduna", center: [10.5264, 7.4382] as [number, number], zoom: 11 },
];

const MAP_STYLES = [
  { id: "streets" as const, label: "Streets", url: "https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=pcDpTtijmUTnmmU8k6xp", ext: "png" },
  { id: "satellite" as const, label: "Satellite", url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=pcDpTtijmUTnmmU8k6xp", ext: "jpg" },
];
type MapStyle = "streets" | "satellite";

interface LayerState {
  railLines: boolean;
  stationDots: boolean;
  trainMarkers: boolean;
  routePath: boolean;
}

interface MapTrackerProps {
  fromStationId?: string;
  toStationId?: string;
  stops?: string[];
  className?: string;
  liveTrains?: LiveTrain[];
}

export function MapTracker({ fromStationId, toStationId, stops = [], className = "", liveTrains = [] }: MapTrackerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<typeof L.map> | null>(null);
  const tileLayerRef = useRef<ReturnType<typeof L.tileLayer> | null>(null);
  const railLinesLayerRef = useRef<ReturnType<typeof L.geoJSON> | null>(null);
  const stationDotsLayerRef = useRef<L.LayerGroup | null>(null);
  const trainMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<ReturnType<typeof L.marker> | null>(null);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>("streets");
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [layers, setLayers] = useState<LayerState>({
    railLines: true,
    stationDots: true,
    trainMarkers: true,
    routePath: true,
  });
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showZoomPanel, setShowZoomPanel] = useState(false);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [9.082, 8.6753],
      zoom: 6,
      zoomControl: true,
      attributionControl: false,
    });

    tileLayerRef.current = L.tileLayer(MAP_STYLES[0].url, {
      maxZoom: 19,
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(map);

    // Station dots layer
    const stationGroup = L.layerGroup().addTo(map);
    Object.entries(STATION_COORDS).forEach(([id, coords]) => {
      const isEndpoint = id === fromStationId || id === toStationId;
      const isStop = stops.includes(id);
      if (!isEndpoint && !isStop) {
        L.circleMarker(coords, {
          radius: 4,
          fillColor: "#6ee7b7",
          color: "#065f46",
          weight: 1,
          fillOpacity: 0.5,
        }).addTo(stationGroup);
      }
    });
    stationDotsLayerRef.current = stationGroup;

    // Train markers layer
    const trainGroup = L.layerGroup().addTo(map);
    trainMarkersLayerRef.current = trainGroup;

    // Route layer
    const routeGroup = L.layerGroup().addTo(map);
    routeLayerRef.current = routeGroup;

    if (fromStationId && toStationId) {
      const routeIds = [fromStationId, ...stops, toStationId];
      const routeCoords = routeIds.map((id) => STATION_COORDS[id]).filter(Boolean) as [number, number][];
      if (routeCoords.length >= 2) {
        L.polyline(routeCoords, { color: "#f59e0b", weight: 4, opacity: 0.9, dashArray: "8 4" }).addTo(routeGroup);
        routeCoords.forEach((coord, i) => {
          const isFirst = i === 0;
          const isLast = i === routeCoords.length - 1;
          L.circleMarker(coord, {
            radius: isFirst || isLast ? 10 : 6,
            fillColor: isFirst ? "#22c55e" : isLast ? "#ef4444" : "#f59e0b",
            color: "#fff",
            weight: 2,
            fillOpacity: 1,
          })
            .bindTooltip(routeIds[i], { permanent: false, direction: "top" })
            .addTo(routeGroup);
        });
        map.fitBounds(L.latLngBounds(routeCoords), { padding: [40, 40] });
      }
    }

    // Load GeoJSON rail lines
    fetch("/railways.geojson")
      .then((r) => r.json())
      .then((data) => {
        if (!mapInstanceRef.current) return;
        const geoLayer = L.geoJSON(data, {
          filter: (f) => f.geometry.type === "LineString",
          style: { color: "#f59e0b", weight: 2, opacity: 0.7 },
        }).addTo(map);
        railLinesLayerRef.current = geoLayer;

        // GeoJSON station points (from HOT OSM)
        L.geoJSON(data, {
          filter: (f) => f.geometry.type === "Point" && f.properties?.railway === "station",
          pointToLayer: (_f, latlng) =>
            L.circleMarker(latlng, { radius: 4, fillColor: "#6ee7b7", color: "#065f46", weight: 1, fillOpacity: 0.8 }),
          onEachFeature: (f, layer) => {
            if (f.properties?.name) layer.bindTooltip(f.properties.name, { direction: "top" });
          },
        }).addTo(stationGroup);
      })
      .catch(() => {});

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      railLinesLayerRef.current = null;
      stationDotsLayerRef.current = null;
      trainMarkersLayerRef.current = null;
      routeLayerRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  // Swap tile layer when style changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;
    map.removeLayer(tileLayerRef.current);
    const style = MAP_STYLES.find((s) => s.id === mapStyle)!;
    const isSat = mapStyle === "satellite";
    tileLayerRef.current = L.tileLayer(style.url, {
      maxZoom: isSat ? 20 : 19,
      tileSize: 512,
      zoomOffset: -1,
      detectRetina: isSat,
    });
    tileLayerRef.current.addTo(map);
    tileLayerRef.current.bringToBack();
  }, [mapStyle]);

  // Toggle layers on/off
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const toggle = (layer: L.Layer | null, visible: boolean) => {
      if (!layer) return;
      if (visible && !map.hasLayer(layer)) map.addLayer(layer);
      if (!visible && map.hasLayer(layer)) map.removeLayer(layer);
    };

    toggle(railLinesLayerRef.current, layers.railLines);
    toggle(stationDotsLayerRef.current, layers.stationDots);
    toggle(trainMarkersLayerRef.current, layers.trainMarkers);
    toggle(routeLayerRef.current, layers.routePath);
  }, [layers]);

  // Update live train markers
  useEffect(() => {
    const group = trainMarkersLayerRef.current;
    if (!group) return;
    group.clearLayers();

    liveTrains
      .filter((t) => t.status === "on-time" || t.status === "delayed")
      .forEach((train) => {
        const color = train.status === "delayed" ? "#f59e0b" : "#22c55e";
        const icon = L.divIcon({
          html: `<div style="width:24px;height:24px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px ${color}55;display:flex;align-items:center;justify-content:center;font-size:11px">🚂</div>`,
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        L.marker([train.currentLat, train.currentLng], { icon })
          .bindTooltip(
            `<b>${train.name}</b><br/>${train.trainNumber}<br/>` +
            (train.prevStationName ? `From: ${train.prevStationName}<br/>` : "") +
            `Next: ${train.nextStationName}<br/>Progress: ${train.progressPct}%` +
            (train.delayMinutes > 0 ? `<br/><span style="color:#f59e0b">Delayed +${train.delayMinutes}m</span>` : ""),
            { direction: "top", offset: [0, -8] }
          )
          .addTo(group);
      });
  }, [liveTrains]);

  // User location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!userLocation || !map) return;
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
    const pulseIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3),0 0 0 8px rgba(59,130,246,0.1)"></div>`,
      className: "",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    userMarkerRef.current = L.marker(userLocation, { icon: pulseIcon })
      .bindTooltip("📍 You are here", { permanent: false })
      .addTo(map);
    map.setView(userLocation, 10, { animate: true });
  }, [userLocation]);

  const locateUser = () => {
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        setLocError("Location access denied.");
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const flyTo = (center: [number, number], zoom: number) => {
    mapInstanceRef.current?.flyTo(center, zoom, { animate: true, duration: 1.2 });
    setShowZoomPanel(false);
  };

  const toggleLayer = (key: keyof LayerState) =>
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  const closeAll = () => {
    setShowStylePanel(false);
    setShowLayerPanel(false);
    setShowZoomPanel(false);
  };

  const LAYER_LABELS: { key: keyof LayerState; label: string }[] = [
    { key: "railLines", label: "Railway Lines" },
    { key: "stationDots", label: "Station Dots" },
    { key: "trainMarkers", label: "Train Markers" },
    { key: "routePath", label: "Route Path" },
  ];

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border shadow-lg ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[320px]" />

      {/* Top-left controls: Style + Layers + Zoom */}
      <div className="absolute top-3 left-3 z-[9999] flex flex-col gap-2">

        {/* Map Style */}
        <div className="relative">
          <button
            onClick={() => { closeAll(); setShowStylePanel((v) => !v); }}
            className="flex items-center gap-1.5 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs font-medium shadow-md hover:bg-card transition-colors text-foreground"
          >
            <Map className="w-3.5 h-3.5 text-primary" />
            {MAP_STYLES.find((s) => s.id === mapStyle)?.label}
            {mapStyle === "satellite" && <span className="text-[9px] bg-primary/20 text-primary px-1 rounded">HD</span>}
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          {showStylePanel && (
            <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-32 z-[9999]">
              {MAP_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setMapStyle(s.id); setShowStylePanel(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center justify-between ${
                    mapStyle === s.id ? "text-primary font-semibold bg-primary/5" : "text-foreground"
                  }`}
                >
                  {s.label}
                  {mapStyle === s.id && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Layer Toggles */}
        <div className="relative">
          <button
            onClick={() => { closeAll(); setShowLayerPanel((v) => !v); }}
            className="flex items-center gap-1.5 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs font-medium shadow-md hover:bg-card transition-colors text-foreground"
          >
            <Layers className="w-3.5 h-3.5 text-primary" />
            Layers
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          {showLayerPanel && (
            <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-44 z-[9999]">
              {LAYER_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleLayer(key)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center justify-between text-foreground"
                >
                  <span className={layers[key] ? "" : "text-muted-foreground line-through"}>{label}</span>
                  {layers[key]
                    ? <Eye className="w-3.5 h-3.5 text-primary" />
                    : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom Presets */}
        <div className="relative">
          <button
            onClick={() => { closeAll(); setShowZoomPanel((v) => !v); }}
            className="flex items-center gap-1.5 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs font-medium shadow-md hover:bg-card transition-colors text-foreground"
          >
            <MapPin className="w-3.5 h-3.5 text-primary" />
            Jump To
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          {showZoomPanel && (
            <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-40 z-[9999]">
              {ZOOM_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => flyTo(p.center, p.zoom)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top-right: My Location */}
      <div className="absolute top-3 right-3 z-[9999]">
        <Button
          size="sm"
          variant="secondary"
          onClick={locateUser}
          disabled={locating}
          className="shadow-lg bg-card/90 backdrop-blur-sm border border-border hover:bg-card text-foreground h-9 px-3"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Navigation className="w-4 h-4 mr-1.5 text-blue-500" />}
          {locating ? "Locating..." : "My Location"}
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[9999] bg-card/90 backdrop-blur-sm border border-border rounded-xl px-3 py-2 text-xs space-y-1">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /><span className="text-muted-foreground">On Time</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /><span className="text-muted-foreground">Delayed</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /><span className="text-muted-foreground">You</span></div>
      </div>

      {/* Error toast */}
      {locError && (
        <div className="absolute bottom-3 right-3 z-[9999] bg-destructive/90 text-destructive-foreground text-xs px-3 py-2 rounded-xl flex items-center gap-2 max-w-[200px]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {locError}
        </div>
      )}

      {/* No route hint */}
      {!fromStationId && !toStationId && (
        <div className="absolute inset-0 flex items-end justify-center pb-12 pointer-events-none z-[999]">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Search a route to visualize it on the map
          </div>
        </div>
      )}

      {/* Click-outside backdrop to close panels */}
      {(showStylePanel || showLayerPanel || showZoomPanel) && (
        <div className="absolute inset-0 z-[999]" onClick={closeAll} />
      )}
    </div>
  );
}
