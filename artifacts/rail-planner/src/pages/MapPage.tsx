import { MapTracker } from "@/components/MapTracker";
import { useLiveTrains } from "@/hooks/useLiveTrains";
import { MapPin, Radio, Clock } from "lucide-react";
import { STATIONS } from "@/lib/data";

function fmt(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function MapPage() {
  const trains = useLiveTrains(30000);
  const activeTrains = trains.filter((t) => t.status === "on-time" || t.status === "delayed");
  const notStarted = trains.filter((t) => t.status === "not-started");

  // Read route from URL params (set by ResultsPage "View on Map" button)
  const params = new URLSearchParams(window.location.search);
  const fromId = params.get("from") ?? undefined;
  const toId = params.get("to") ?? undefined;

  // Find intermediate stops from the matching live train
  const matchedTrain = fromId && toId
    ? trains.find((t) => t.fromId === fromId && t.toId === toId)
    : undefined;
  const routeStops = matchedTrain
    ? matchedTrain.allStopIds.slice(1, -1)
    : [];

  const fromStation = STATIONS.find((s) => s.id === fromId);
  const toStation = STATIONS.find((s) => s.id === toId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-1">
            <MapPin className="w-6 h-6 text-secondary" />
            <h1 className="text-2xl font-extrabold">Live Rail Map</h1>
            {fromStation && toStation ? (
              <span className="text-sm font-medium text-primary-foreground/80 ml-1">
                {fromStation.city} → {toStation.city}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded-full ml-2">
                <Radio className="w-3 h-3 animate-pulse" />
                Schedule-Based Live Tracking
              </span>
            )}
          </div>
          <p className="text-primary-foreground/70 text-sm">
            Train positions calculated from real timetable + current time. Updates every 30 seconds.
          </p>
        </div>
      </div>

      <div className="flex-1 container mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Map — isolated stacking context */}
          <div className="relative isolate">
            <MapTracker
              className="h-[60vh] lg:h-[75vh]"
              liveTrains={trains}
              fromStationId={fromId}
              toStationId={toId}
              stops={routeStops}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Active trains */}
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-primary animate-pulse" />
                  <h3 className="font-bold text-sm">Active Trains</h3>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {activeTrains.length} running
                </span>
              </div>

              {activeTrains.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No trains currently running on the network.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {activeTrains.map((train) => (
                    <div key={train.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{train.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{train.trainNumber}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          train.status === "on-time"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}>
                          {train.status === "on-time" ? "ON TIME" : `+${train.delayMinutes}m`}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        {train.prevStationName} → <span className="text-foreground font-medium">{train.nextStationName}</span>
                      </p>

                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            train.status === "on-time" ? "bg-green-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${train.progressPct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {train.progressPct}% complete
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming trains */}
            {notStarted.length > 0 && (
              <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-bold text-sm">Departing Today</h3>
                </div>
                <div className="divide-y divide-border">
                  {notStarted.map((train) => (
                    <div key={train.id} className="px-4 py-3">
                      <p className="font-semibold text-sm">{train.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{train.trainNumber}</p>
                      <p className="text-xs text-primary mt-1">
                        Departs {fmt(train.departureMinutes + train.delayMinutes)}
                        {train.delayMinutes > 0 && (
                          <span className="text-amber-500 ml-1">(+{train.delayMinutes}m delay)</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-xs text-muted-foreground leading-relaxed">
              <p className="font-semibold text-primary mb-1">How positions work</p>
              <p>
                Train locations are calculated from the official NRC timetable and your current time.
                Position updates every 30 seconds. Hover a 🚂 marker on the map for details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
