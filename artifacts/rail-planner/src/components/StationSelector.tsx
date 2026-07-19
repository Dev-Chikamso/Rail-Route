import { useState } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Station } from "@/lib/data";

interface StationSelectorProps {
  stations: Station[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function StationSelector({
  stations,
  value,
  onChange,
  placeholder = "Select station...",
  disabled = false,
}: StationSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedStation = stations.find((s) => s.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between h-14 bg-background font-normal text-left"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
            {selectedStation ? (
              <span className="truncate">
                <span className="font-semibold text-foreground">{selectedStation.name}</span>
                <span className="text-muted-foreground ml-2 text-sm">{selectedStation.code}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search stations..." />
          <CommandList>
            <CommandEmpty>No station found.</CommandEmpty>
            <CommandGroup>
              {stations.map((station) => (
                <CommandItem
                  key={station.id}
                  value={`${station.name} ${station.code} ${station.city}`}
                  onSelect={() => {
                    onChange(station.id);
                    setOpen(false);
                  }}
                  className="flex flex-col items-start py-3"
                >
                  <div className="flex items-center w-full">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === station.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 truncate flex items-center justify-between">
                      <span className="font-medium text-base truncate">{station.name}</span>
                      <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground ml-2">{station.code}</span>
                    </div>
                  </div>
                  <div className="pl-6 text-sm text-muted-foreground mt-1">
                    {station.city}, {station.state}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
