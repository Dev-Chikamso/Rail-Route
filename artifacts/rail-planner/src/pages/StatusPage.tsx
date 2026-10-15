import { SYSTEM_STATUS } from "@/lib/data";
import { CheckCircle2, AlertTriangle, XCircle, Activity, Server, Clock, MapPin, LocateFixed, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/lib/utils";
import { useGeolocation, getNearestLine } from "@/hooks/useGeolocation";

export default function StatusPage() {
  const status = SYSTEM_STATUS;
  const { status: geoStatus, location, error: geoError, request } = useGeolocation();

  const nearestLine = location ? getNearestLine(location.lat, location.lng) : null;

  const overallColors = {
    operational: "bg-green-50 border-green-200 text-green-800",
    degraded: "bg-amber-50 border-amber-200 text-amber-800",
    outage: "bg-red-50 border-red-200 text-red-800",
  };

  const severityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-amber-100 text-amber-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">System Status</h1>
          <p className="text-muted-foreground">Current operational status of NRC and LAMATA lines.</p>
        </div>

        {/* Location Banner */}
        <div className="mb-6">
          {geoStatus === "idle" && (
            <div className="border rounded-xl p-5 bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <LocateFixed className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Enable location for personalised status</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We'll show the service status most relevant to your current location.
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={request} className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
                <MapPin className="w-4 h-4 mr-2" /> Share My Location
              </Button>
            </div>
          )}

          {geoStatus === "requesting" && (
            <div className="border rounded-xl p-5 bg-card shadow-sm flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
              <p className="text-sm">Requesting your location…</p>
            </div>
          )}

          {geoStatus === "granted" && location && (
            <div className="border border-green-200 rounded-xl p-5 bg-green-50 shadow-sm">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800 text-sm">
                      Location detected:{" "}
                      <span className="font-bold">
                        {location.city ?? "Unknown area"}{location.region ? `, ${location.region}` : ""}
                      </span>
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)} · Accuracy ±{Math.round(location.accuracy)}m
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white border-transparent shrink-0">Location Active</Badge>
              </div>

              {nearestLine ? (
                <div className="mt-4 border border-green-300 rounded-lg p-4 bg-white/60">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Nearest Line to You</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-green-900">{nearestLine}</span>
                    <Badge className="bg-green-600 text-white border-transparent">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Operational
                    </Badge>
                  </div>
                  <p className="text-xs text-green-700 mt-1">No disruptions reported on this line.</p>
                </div>
              ) : (
                <div className="mt-4 border border-green-300 rounded-lg p-3 bg-white/60">
                  <p className="text-xs text-green-700">
                    Your location is outside the current NRC/LAMATA service area. Showing national status below.
                  </p>
                </div>
              )}
            </div>
          )}

          {geoStatus === "denied" && (
            <div className="border border-amber-200 rounded-xl p-5 bg-amber-50 shadow-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Location access denied</p>
                <p className="text-xs text-amber-700 mt-0.5">{geoError}</p>
              </div>
            </div>
          )}

          {geoStatus === "unavailable" && (
            <div className="border border-red-200 rounded-xl p-5 bg-red-50 shadow-sm flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{geoError}</p>
            </div>
          )}
        </div>

        {/* Overall Status Banner */}
        <div className={`border rounded-xl p-6 mb-8 flex items-start gap-4 shadow-sm ${overallColors[status.overallStatus]}`}>
          {status.overallStatus === "operational" && <CheckCircle2 className="w-8 h-8 shrink-0 mt-1" />}
          {status.overallStatus === "degraded" && <AlertTriangle className="w-8 h-8 shrink-0 mt-1" />}
          {status.overallStatus === "outage" && <XCircle className="w-8 h-8 shrink-0 mt-1" />}
          <div>
            <h2 className="text-xl font-bold capitalize mb-1">System is {status.overallStatus}</h2>
            <p className="opacity-90">
              {status.overallStatus === "operational" && "All services and data sources are operating normally."}
              {status.overallStatus === "degraded" && "Some services are experiencing issues or falling back to static data."}
              {status.overallStatus === "outage" && "Major system outage. Live data is currently unavailable."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Data Sources */}
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-muted-foreground" /> API Connectivity
            </h3>
            <div className="space-y-4">
              {status.dataSources.map((source) => (
                <Card key={source.name} className="shadow-sm">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-semibold">{source.name}</CardTitle>
                    <Badge variant={source.available ? "success" : "destructive"}>
                      {source.available ? "Online" : "Offline"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Checked {formatTime(source.lastChecked)}
                      </span>
                      {source.latencyMs !== null && (
                        <span className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5" /> {source.latencyMs}ms
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Active Disruptions */}
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-muted-foreground" /> Active Disruptions
            </h3>
            {status.activeDisruptions.length === 0 ? (
              <Card className="shadow-sm border-dashed border-2 bg-transparent">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <p className="font-medium">No active disruptions reported.</p>
                  <p className="text-sm mt-1">All lines operating on schedule.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {status.activeDisruptions.map((disruption) => (
                  <Card key={disruption.id} className="shadow-sm overflow-hidden">
                    <div className={`h-1 w-full ${disruption.severity === "high" ? "bg-destructive" : disruption.severity === "medium" ? "bg-amber-500" : "bg-blue-500"}`} />
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start mb-1">
                        <Badge variant="outline" className="font-mono bg-muted">{disruption.lineName}</Badge>
                        <Badge variant="secondary" className={`border-transparent ${severityColors[disruption.severity]} uppercase text-[10px] tracking-wider`}>
                          {disruption.severity}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold leading-tight">{disruption.description}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="text-sm text-muted-foreground">
                        <strong>Affected Stations:</strong>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {disruption.affectedStations.map((station) => (
                            <span key={station} className="bg-muted px-2 py-0.5 rounded text-xs">{station}</span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
