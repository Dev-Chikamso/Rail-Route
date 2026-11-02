import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowRightLeft, Search, MapPin, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { STATIONS } from "@/lib/data";
import { StationSelector } from "@/components/StationSelector";
import { useGeolocation, getNearestStation } from "@/hooks/useGeolocation";

interface RouteSearchFormProps {
  onSearch?: (from: string, to: string, date: string, fromUserLocation?: boolean) => void;
}

export function RouteSearchForm({ onSearch }: RouteSearchFormProps = {}) {
  const [, setLocation] = useLocation();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [fromUserLocation, setFromUserLocation] = useState(false);
  const { status: geoStatus, location, request: requestGeo } = useGeolocation();

  // Auto-fill nearest station when location becomes available
  useEffect(() => {
    if (geoStatus === "granted" && location && !from) {
      const nearest = getNearestStation(location.lat, location.lng);
      if (nearest) {
        setFrom(nearest.id);
        setFromUserLocation(true);
      }
    }
  }, [geoStatus, location]);

  const handleFromChange = (val: string) => {
    setFrom(val);
    setFromUserLocation(false); // user manually changed it
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return;
    const dateStr = format(date, "yyyy-MM-dd");
    onSearch?.(from, to, dateStr, fromUserLocation);
    setLocation(`/results?from=${from}&to=${to}&date=${dateStr}`);
  };

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const saturday = new Date(today); saturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));

  const quickDates = [
    { label: "Today", date: today },
    { label: "Tomorrow", date: tomorrow },
    { label: "Weekend", date: saturday },
  ];

  const dateStr = format(date, "yyyy-MM-dd");
  const todayStr = format(today, "yyyy-MM-dd");
  const nearestStation = location ? getNearestStation(location.lat, location.lng) : null;

  return (
    <form onSubmit={handleSearch} className="bg-card p-5 md:p-7 rounded-2xl shadow-2xl border border-card-border relative z-10 max-w-4xl mx-auto -mt-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-card-foreground">Find a Route</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">🇳🇬 NRC Network</span>
      </div>

      {/* Location auto-fill notice */}
      {geoStatus === "idle" && (
        <button type="button" onClick={requestGeo} className="w-full mb-4 flex items-center gap-2 text-xs text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors">
          <MapPin className="w-3.5 h-3.5 shrink-0" /> Use my current location as origin
        </button>
      )}
      {geoStatus === "requesting" && (
        <div className="w-full mb-4 flex items-center gap-2 text-xs text-muted-foreground border rounded-lg px-3 py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> Detecting your location…
        </div>
      )}
      {geoStatus === "granted" && fromUserLocation && nearestStation && (
        <div className="w-full mb-4 flex items-center gap-2 text-xs text-green-700 border border-green-200 bg-green-50 rounded-lg px-3 py-2">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          Origin set to nearest station: <span className="font-semibold">{nearestStation.name}</span>
          <span className="text-green-600 ml-auto">{nearestStation.distanceKm} km away</span>
        </div>
      )}

      {/* Station row */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end mb-4">
        <div className="min-w-0">
          <label className="block text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wider">From</label>
          <StationSelector stations={STATIONS} value={from} onChange={handleFromChange} placeholder="Origin Station" />
        </div>
        <div className="flex justify-center pb-1">
          <button type="button" onClick={() => { setFrom(to); setTo(from); setFromUserLocation(false); }} className="h-9 w-9 rounded-full bg-secondary/20 hover:bg-secondary/40 flex items-center justify-center transition-all hover:scale-110" aria-label="Swap stations">
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>
        <div className="min-w-0">
          <label className="block text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wider">To</label>
          <StationSelector stations={STATIONS} value={to} onChange={setTo} placeholder="Destination Station" />
        </div>
      </div>

      {/* Date row */}
      <div className="mb-4">
        <label className="block text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wider">Date</label>
        <div className="flex items-center gap-2 flex-wrap">
          {quickDates.map(({ label, date: qd }) => {
            const qStr = format(qd, "yyyy-MM-dd");
            const isSelected = dateStr === qStr;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setDate(qd)}
                className={cn(
                  "h-10 px-4 rounded-lg border text-sm font-medium transition-all shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-foreground border-border hover:border-primary/60 hover:bg-primary/5"
                )}
              >
                {label}
              </button>
            );
          })}

          {/* Native date input */}
          <input
            type="date"
            value={dateStr}
            min={todayStr}
            onChange={(e) => e.target.value && setDate(new Date(e.target.value + "T00:00:00"))}
            className={cn(
              "h-10 flex-1 min-w-[150px] rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground cursor-pointer transition-colors",
              "hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
              !quickDates.some(({ date: qd }) => format(qd, "yyyy-MM-dd") === dateStr) && "border-primary text-primary"
            )}
          />
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t">
        <p className="text-sm text-muted-foreground">
          Travelling on <span className="font-semibold text-foreground">{format(date, "EEEE, MMMM d, yyyy")}</span>
        </p>
        <Button type="submit" size="lg" className="h-11 px-8 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold shadow-md whitespace-nowrap shrink-0" disabled={!from || !to}>
          <Search className="w-4 h-4 mr-2 shrink-0" /> Search
        </Button>
      </div>
    </form>
  );
}
