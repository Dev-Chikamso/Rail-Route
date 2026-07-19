import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowRightLeft, Search } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { STATIONS } from "@/lib/data";
import { StationSelector } from "@/components/StationSelector";

interface RouteSearchFormProps {
  onSearch?: (from: string, to: string, date: string) => void;
}

export function RouteSearchForm({ onSearch }: RouteSearchFormProps = {}) {
  const [, setLocation] = useLocation();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return;
    const dateStr = format(date, "yyyy-MM-dd");
    onSearch?.(from, to, dateStr);
    setLocation(`/results?from=${from}&to=${to}&date=${dateStr}`);
  };

  return (
    <form onSubmit={handleSearch} className="bg-card p-5 md:p-7 rounded-2xl shadow-2xl border border-card-border relative z-10 max-w-4xl mx-auto -mt-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-card-foreground">Find a Route</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">🇳🇬 NRC Network</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end mb-3">
        <div className="min-w-0">
          <label className="block text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wider">From</label>
          <StationSelector stations={STATIONS} value={from} onChange={setFrom} placeholder="Origin Station" />
        </div>
        <div className="flex justify-center pb-1">
          <button type="button" onClick={() => { setFrom(to); setTo(from); }} className="h-9 w-9 rounded-full bg-secondary/20 hover:bg-secondary/40 flex items-center justify-center transition-all hover:scale-110" aria-label="Swap stations">
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>
        <div className="min-w-0">
          <label className="block text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wider">To</label>
          <StationSelector stations={STATIONS} value={to} onChange={setTo} placeholder="Destination Station" />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
        <div className="min-w-0">
          <label className="block text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wider">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full h-12 justify-start text-left font-normal bg-background", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{date ? format(date, "MMM d, yyyy") : "Pick a date"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} />
            </PopoverContent>
          </Popover>
        </div>
        <Button type="submit" size="lg" className="h-12 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold shadow-md whitespace-nowrap shrink-0" disabled={!from || !to}>
          <Search className="w-4 h-4 mr-2 shrink-0" />Search
        </Button>
      </div>
    </form>
  );
}
