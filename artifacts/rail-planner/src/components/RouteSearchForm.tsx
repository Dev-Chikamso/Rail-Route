import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useLocation } from "wouter";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useListStations } from "@workspace/api-client-react";
import { StationSelector } from "@/components/StationSelector";
import { Skeleton } from "@/components/ui/skeleton";

export function RouteSearchForm() {
  const [, setLocation] = useLocation();
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  
  const { data: stations, isLoading } = useListStations();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return;
    
    const params = new URLSearchParams();
    params.set("from", from);
    params.set("to", to);
    if (date) {
      params.set("date", format(date, "yyyy-MM-dd"));
    }
    
    setLocation(`/results?${params.toString()}`);
  };

  const swapStations = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <form onSubmit={handleSearch} className="bg-card p-6 md:p-8 rounded-xl shadow-xl border border-card-border relative z-10 max-w-4xl mx-auto -mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-card-foreground">Find a Route</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_auto] gap-4 items-center">
        {/* From Station */}
        <div className="w-full">
          <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">From</label>
          {isLoading ? (
            <Skeleton className="h-14 w-full" />
          ) : (
            <StationSelector
              stations={stations || []}
              value={from}
              onChange={setFrom}
              placeholder="Origin Station"
            />
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center md:pt-8">
          <button
            type="button"
            onClick={swapStations}
            className="h-10 w-10 rounded-full bg-secondary/20 hover:bg-secondary/40 flex items-center justify-center text-secondary-foreground transition-colors group"
            aria-label="Swap stations"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right-left group-hover:scale-110 transition-transform"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
          </button>
        </div>

        {/* To Station */}
        <div className="w-full">
          <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">To</label>
          {isLoading ? (
            <Skeleton className="h-14 w-full" />
          ) : (
            <StationSelector
              stations={stations || []}
              value={to}
              onChange={setTo}
              placeholder="Destination Station"
            />
          )}
        </div>

        {/* Date */}
        <div className="w-full md:w-48">
          <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full h-14 justify-start text-left font-normal bg-background",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Submit */}
        <div className="w-full md:pt-8">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full h-14 bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg font-bold shadow-md"
            disabled={!from || !to}
          >
            Search Route
          </Button>
        </div>
      </div>
    </form>
  );
}
