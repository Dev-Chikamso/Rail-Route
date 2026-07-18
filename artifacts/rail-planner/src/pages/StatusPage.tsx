import { useGetSystemStatus } from "@workspace/api-client-react";
import { CheckCircle2, AlertTriangle, XCircle, Activity, Server, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/lib/utils";

export default function StatusPage() {
  const { data: status, isLoading, error } = useGetSystemStatus();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Status Unavailable</h2>
        <p className="text-muted-foreground">Could not connect to the system status service.</p>
      </div>
    );
  }

  const overallColors = {
    operational: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400",
    degraded: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400",
    outage: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400"
  };

  const severityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-background pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">System Status</h1>
          <p className="text-muted-foreground">Current operational status of NRC API and train lines.</p>
        </div>

        {/* Overall Status Banner */}
        <div className={`border rounded-xl p-6 mb-8 flex items-start gap-4 shadow-sm ${overallColors[status.overallStatus]}`}>
          {status.overallStatus === 'operational' && <CheckCircle2 className="w-8 h-8 shrink-0 mt-1" />}
          {status.overallStatus === 'degraded' && <AlertTriangle className="w-8 h-8 shrink-0 mt-1" />}
          {status.overallStatus === 'outage' && <XCircle className="w-8 h-8 shrink-0 mt-1" />}
          
          <div>
            <h2 className="text-xl font-bold capitalize mb-1">
              System is {status.overallStatus}
            </h2>
            <p className="opacity-90">
              {status.overallStatus === 'operational' && "All services and data sources are operating normally."}
              {status.overallStatus === 'degraded' && "Some services are experiencing issues or falling back to static data."}
              {status.overallStatus === 'outage' && "Major system outage. Live data is currently unavailable."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Data Sources */}
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-muted-foreground" />
              API Connectivity
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
                        <Clock className="w-3.5 h-3.5" />
                        Checked {formatTime(source.lastChecked)}
                      </span>
                      {source.latencyMs && (
                         <span className="flex items-center gap-1">
                           <Activity className="w-3.5 h-3.5" />
                           {source.latencyMs}ms
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
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
              Active Disruptions
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
                    <div className={`h-1 w-full ${disruption.severity === 'high' ? 'bg-destructive' : disruption.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
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
                          {disruption.affectedStations.map(station => (
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
