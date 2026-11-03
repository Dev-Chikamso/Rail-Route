import { useState } from "react";
import { STATIONS, TIMETABLE_EXPORT } from "@/lib/data";
import { useTripTracker } from "@/hooks/useTripTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation, Gauge, Clock, MapPin, StopCircle, Radio, AlertCircle } from "lucide-react";

function fmt(mins: number | null): string {
  if (mins === null) return "—";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function TripPage() {
  const { trip, geoError, isTracking, startTrip, stopTrip } = useTripTracker();
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");

  const matchedRoute = TIMETABLE_EXPORT.find(
    (t) => t.stops.includes(fromId) && t.stops.includes(toId) && t.stops.indexOf(fromId) < t.stops.indexOf(toId)
  );

  const handleStart = () => {
    if (!fromId || !toId || !matchedRoute) return;
    const fi = matchedRoute.stops.indexOf(fromId);
    const ti = matchedRoute.stops.indexOf(toId);
    const segRatio = (ti - fi) / (matchedRoute.stops.length - 1);
    const segDur = Math.round(matchedRoute.durMins * segRatio);
    startTrip(fromId, toId, matchedRoute.lineName, segDur);
  };

  const lastPing = trip.pings[trip.pings.length - 1] ?? null;
  const prevPing = trip.pings[trip.pings.length - 2] ?? null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
            <Navigation className="w-7 h-7 text-primary" /> Live Trip Tracker
          </h1>
          <p className="text-muted-foreground text-sm">
            User A — share your real-time location so others can see train progress.
          </p>
        </div>

        {!isTracking ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Start a Trip</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                  <Select value={fromId} onValueChange={setFromId}>
                    <SelectTrigger><SelectValue placeholder="Departure" /></SelectTrigger>
                    <SelectContent>
                      {STATIONS.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                  <Select value={toId} onValueChange={setToId}>
                    <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
                    <SelectContent>
                      {STATIONS.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {fromId && toId && !matchedRoute && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> No direct route found for this pair.
                </p>
              )}

              {matchedRoute && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-primary">{matchedRoute.lineName}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Train {matchedRoute.trainNumber} · Static duration: ~{matchedRoute.durMins} min
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                disabled={!fromId || !toId || !matchedRoute}
                onClick={handleStart}
              >
                <Radio className="w-4 h-4 mr-2 animate-pulse" /> Start Trip & Share Location
              </Button>

              {geoError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {geoError}
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Trip Header */}
            <Card className="shadow-sm border-primary/30">
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-bold text-base">{trip.lineName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {STATIONS.find((s) => s.id === trip.fromId)?.name} →{" "}
                    {STATIONS.find((s) => s.id === trip.toId)?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600 text-white border-transparent">
                    <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse inline-block" />
                    Live
                  </Badge>
                  <Button size="sm" variant="destructive" onClick={stopTrip}>
                    <StopCircle className="w-4 h-4 mr-1" /> End Trip
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-700"><Gauge className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Speed</p>
                    <p className="text-2xl font-extrabold">
                      {trip.speedKmh !== null ? Math.round(trip.speedKmh) : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">km/h</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-700"><Clock className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">ETA to destination</p>
                    <p className="text-2xl font-extrabold">{fmt(trip.etaMins)}</p>
                    <p className="text-xs text-muted-foreground">
                      Static: {fmt(trip.staticDurationMins)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* GPS Pings */}
            <Card className="shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Location Pings ({trip.pings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {trip.pings.length === 0 && (
                  <p className="text-xs text-muted-foreground">Waiting for first GPS fix…</p>
                )}
                {[prevPing, lastPing].filter(Boolean).map((ping, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3 text-xs font-mono">
                    <span className="text-muted-foreground mr-2">Interval {trip.pings.length - (ping === prevPing ? 1 : 0)}</span>
                    <span className="font-semibold">Lat: {ping!.lat.toFixed(5)}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span className="font-semibold">Lng: {ping!.lng.toFixed(5)}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span>{new Date(ping!.time).toLocaleTimeString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {geoError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {geoError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
