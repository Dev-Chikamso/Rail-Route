import { useLocation } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Clock, MapPin, AlertTriangle, ChevronDown, CheckCircle2 } from "lucide-react";
import { useSearchRoutes } from "@workspace/api-client-react";
import { getSearchRoutesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, formatTime } from "@/lib/utils";
import type { TrainRoute } from "@workspace/api-client-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function RouteCard({ route, isFastest = false }: { route: TrainRoute; isFastest?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const isDelayed = route.status === "delayed";
  const isDisrupted = route.status === "disrupted" || route.status === "cancelled";
  
  const statusColor = isDisrupted ? "bg-destructive text-destructive-foreground" : isDelayed ? "bg-amber-500 text-black" : "bg-green-600 text-white";

  return (
    <div className={`bg-card border rounded-xl overflow-hidden shadow-sm transition-all ${isFastest ? 'ring-2 ring-primary/50' : 'hover:shadow-md'}`}>
      {isFastest && (
        <div className="bg-primary/10 text-primary px-4 py-2 font-semibold text-sm flex items-center gap-2 border-b">
          <Clock className="w-4 h-4" />
          Fastest Available Route
        </div>
      )}
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono bg-muted">{route.lineName}</Badge>
              {route.trainNumber && <span className="text-sm text-muted-foreground font-mono">#{route.trainNumber}</span>}
              <Badge className={`${statusColor} border-transparent ml-2`}>
                {route.status === 'on-time' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {route.status === 'delayed' && <Clock className="w-3 h-3 mr-1" />}
                {isDisrupted && <AlertTriangle className="w-3 h-3 mr-1" />}
                {route.status.toUpperCase()}
                {route.delayMinutes ? ` (+${route.delayMinutes}m)` : ''}
              </Badge>
            </div>
            {route.disruptions && (
              <div className="mt-2 text-sm text-destructive flex items-start gap-1.5 bg-destructive/10 p-2 rounded-md">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{route.disruptions}</p>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-mono">
              {formatDuration(route.durationMinutes)}
            </div>
            <div className="text-sm text-muted-foreground mt-1 flex items-center justify-end gap-1">
              <span className={`w-2 h-2 rounded-full ${route.dataSource === 'live' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
              {route.dataSource === 'live' ? 'Live Tracker' : 'Scheduled Time'}
            </div>
          </div>
        </div>

        <div className="relative flex items-stretch justify-between before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:h-0.5 before:bg-border before:z-0">
          <div className="relative z-10 bg-card pr-4">
            <div className="text-xl font-bold font-mono">{formatTime(route.departureTime)}</div>
            <div className="font-semibold mt-1">{route.fromStation.name}</div>
            {route.platform && <div className="text-xs text-muted-foreground mt-1">Platform {route.platform}</div>}
          </div>
          
          <div className="relative z-10 bg-card px-4 flex flex-col items-center justify-center text-muted-foreground text-sm font-medium">
            <div className="bg-muted px-3 py-1 rounded-full border mb-1">
              {route.stops.length - 2} stops
            </div>
          </div>

          <div className="relative z-10 bg-card pl-4 text-right">
            <div className="text-xl font-bold font-mono">
              {route.delayMinutes ? (
                 <span className="text-amber-600">
                    {formatTime(new Date(new Date(route.arrivalTime).getTime() + route.delayMinutes * 60000).toISOString())}
                 </span>
              ) : (
                formatTime(route.arrivalTime)
              )}
            </div>
            <div className="font-semibold mt-1">{route.toStation.name}</div>
          </div>
        </div>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full rounded-none border-t h-12 flex justify-between px-6 text-muted-foreground hover:text-foreground">
            View Route Stops
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-6 bg-muted/30 border-t">
            <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-border">
              {route.stops.map((stop, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-background ${i === 0 || i === route.stops.length - 1 ? 'bg-primary' : 'bg-muted-foreground'} z-10`} />
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{stop.stationName}</div>
                      {stop.platform && <div className="text-xs text-muted-foreground">Platform {stop.platform}</div>}
                    </div>
                    <div className="text-right text-sm font-mono text-muted-foreground">
                      {stop.arrivalTime ? formatTime(stop.arrivalTime) : formatTime(route.departureTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export default function ResultsPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const dateStr = searchParams.get("date");

  const queryParams = {
    from: from || "",
    to: to || "",
    ...(dateStr ? { date: dateStr } : {})
  };

  const { data: results, isLoading, error } = useSearchRoutes(queryParams, {
    query: {
      enabled: !!from && !!to,
      queryKey: getSearchRoutesQueryKey(queryParams),
      retry: 1
    }
  });

  if (!from || !to) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Invalid Search Parameters</h2>
        <Button onClick={() => setLocation("/")}>Return to Search</Button>
      </div>
    );
  }

  const handleBack = () => setLocation("/");

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-background pb-20">
      {/* Header Banner */}
      <div className="bg-primary text-primary-foreground py-8 px-4 shadow-md sticky top-16 z-30">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground -ml-4 mb-4 px-4 h-8" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Modify Search
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div className="flex items-center gap-4 text-2xl md:text-3xl font-bold">
              <span>{from}</span>
              <ArrowLeft className="w-6 h-6 rotate-180 text-secondary" />
              <span>{to}</span>
            </div>
            {dateStr && (
              <div className="text-primary-foreground/80 font-medium">
                {format(new Date(dateStr), "EEEE, MMMM d, yyyy")}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl mt-8">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center animate-in zoom-in-95">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">Could not load routes</h2>
            <p className="text-muted-foreground mb-6">There was a problem connecting to the train schedule service.</p>
            <Button variant="outline" onClick={handleBack}>Try another search</Button>
          </div>
        ) : !results || (!results.fastest && results.alternatives.length === 0) ? (
          <div className="bg-card border rounded-xl p-12 text-center animate-in zoom-in-95 shadow-sm">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No routes found</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              We couldn't find any direct trains between these stations for the selected date. 
            </p>
            <Button onClick={handleBack} size="lg">Search Again</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Available Trains</h2>
              {results.searchedAt && (
                <span className="text-xs text-muted-foreground">
                  Updated {formatTime(results.searchedAt)}
                </span>
              )}
            </div>
            
            {results.fastest && (
              <div className="animate-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '100ms' }}>
                 <RouteCard route={results.fastest} isFastest={true} />
              </div>
            )}

            {results.alternatives.map((route, i) => (
               <div key={route.id} className="animate-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${(i + 2) * 100}ms` }}>
                  <RouteCard route={route} />
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
