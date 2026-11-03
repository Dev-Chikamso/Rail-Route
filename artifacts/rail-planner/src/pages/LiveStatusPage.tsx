import { useState, useEffect } from "react";
import { STATIONS, TIMETABLE_EXPORT } from "@/lib/data";
import { getTripState, TripState } from "@/lib/tripStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, Clock, Users, Radio, Info } from "lucide-react";

function fmt(mins: number | null): string {
  if (mins === null || mins < 0) return "—";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function LiveStatusPage() {
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [liveTrip, setLiveTrip] = useState<TripState>(getTripState);

  // Poll localStorage for User A's updates
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "nrc_trip_state") setLiveTrip(getTripState());
    };
    window.addEventListener("storage", onStorage);
    const poll = setInterval(() => setLiveTrip(getTripState()), 5000);
    return () => { window.removeEventListener("storage", onStorage); clearInterval(poll); };
  }, []);

  const myRoute = TIMETABLE_EXPORT.find(
    (t) => t.stops.includes(fromId) && t.stops.includes(toId) && t.stops.indexOf(fromId) < t.stops.indexOf(toId)
  );

  // Find shared station between User B's route and User A's active trip
  const sharedStation = (() => {
    if (!liveTrip.active || !myRoute) return null;
    // The station User B is going FROM — check if it's on User A's route
    const aStops = TIMETABLE_EXPORT.find(
      (t) => t.stops.includes(liveTrip.fromId) && t.stops.includes(liveTrip.toId)
    )?.stops ?? [];
    return aStops.includes(fromId) ? fromId : aStops.includes(toId) ? toId : null;
  })();

  const sharedStationName = STATIONS.find((s) => s.id === sharedStation)?.name ?? sharedStation;

  // Delay calc: compare User A's ETA to static duration
  const delayMins = (() => {
    if (!liveTrip.active || liveTrip.etaMins === null || !liveTrip.staticDurationMins) return null;
    const elapsed = liveTrip.startedAt ? Math.round((Date.now() - liveTrip.startedAt) / 60000) : 0;
    const expectedRemaining = liveTrip.staticDurationMins - elapsed;
    return liveTrip.etaMins - expectedRemaining;
  })();

  const isOnTime = delayMins !== null && delayMins <= 2;
  const isDelayed = delayMins !== null && delayMins > 2;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" /> Live Train Status
          </h1>
          <p className="text-muted-foreground text-sm">
            User B — see real-time train progress shared by other passengers.
          </p>
        </div>

        {/* User B route selection */}
        <Card className="shadow-sm mb-6">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Your Journey</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                <Select value={fromId} onValueChange={setFromId}>
                  <SelectTrigger><SelectValue placeholder="Departure" /></SelectTrigger>
                  <SelectContent>
                    {STATIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                <Select value={toId} onValueChange={setToId}>
                  <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
                  <SelectContent>
                    {STATIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live trip from User A */}
        {!liveTrip.active ? (
          <Card className="shadow-sm border-dashed border-2 bg-transparent">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Radio className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No active trip being shared.</p>
              <p className="text-sm mt-1">When another passenger starts a trip, their data will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Active trip banner */}
            <Card className="shadow-sm border-green-200 bg-green-50">
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-bold text-green-900">{liveTrip.lineName}</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    {STATIONS.find((s) => s.id === liveTrip.fromId)?.name} →{" "}
                    {STATIONS.find((s) => s.id === liveTrip.toId)?.name}
                  </p>
                </div>
                <Badge className="bg-green-600 text-white border-transparent">
                  <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse inline-block" />
                  Live Data
                </Badge>
              </CardContent>
            </Card>

            {/* Shared station status */}
            {sharedStation ? (
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" /> Status at {sharedStationName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">ETA to destination</p>
                      <p className="text-xl font-extrabold">{fmt(liveTrip.etaMins)}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Static schedule</p>
                      <p className="text-xl font-extrabold">{fmt(liveTrip.staticDurationMins)}</p>
                    </div>
                  </div>

                  {delayMins !== null && (
                    <div className={`rounded-lg p-4 flex items-start gap-3 ${isOnTime ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
                      {isOnTime ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-bold text-sm ${isOnTime ? "text-green-800" : "text-amber-800"}`}>
                          {isOnTime ? "On Time" : `Delayed ~${delayMins} min`}
                        </p>
                        <p className={`text-xs mt-0.5 ${isOnTime ? "text-green-700" : "text-amber-700"}`}>
                          {isOnTime
                            ? `Arriving at ${sharedStationName} on schedule.`
                            : `Expected ${fmt(delayMins)} behind schedule at ${sharedStationName}.`}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : fromId && toId ? (
              <Card className="shadow-sm">
                <CardContent className="p-5 flex items-start gap-3 text-muted-foreground">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    The active shared trip doesn't pass through your selected stations. Try a different route.
                  </p>
                </CardContent>
              </Card>
            ) : null}

            {/* Speed info */}
            {liveTrip.speedKmh !== null && (
              <Card className="shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="text-sm">
                    <span className="font-semibold">Current speed: </span>
                    <span>{Math.round(liveTrip.speedKmh)} km/h</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      · Last updated {new Date(liveTrip.lastUpdated).toLocaleTimeString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
