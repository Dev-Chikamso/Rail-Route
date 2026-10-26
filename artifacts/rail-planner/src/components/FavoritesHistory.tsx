import { useState, useEffect } from "react";
import { Heart, History, Trash2, ArrowRight, Star, Clock, MapPin, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface JourneyEntry {
  id: string;
  from: string;
  to: string;
  fromLabel: string;
  toLabel: string;
  date: string;
  searchedAt: string;
  fromUserLocation?: boolean;  // was origin auto-filled from GPS
  searchCount?: number;        // how many times this route has been searched
}

const FAVORITES_KEY = "nrc_favorites";
const HISTORY_KEY = "nrc_history";

export function useFavoritesHistory() {
  const [favorites, setFavorites] = useState<JourneyEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<JourneyEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const addToHistory = (entry: Omit<JourneyEntry, "id" | "searchedAt" | "searchCount">) => {
    const newEntry: JourneyEntry = {
      ...entry,
      id: Date.now().toString(),
      searchedAt: new Date().toISOString(),
      searchCount: 1,
    };
    setHistory((prev) => {
      const existing = prev.find((h) => h.from === entry.from && h.to === entry.to);
      const filtered = prev.filter((h) => !(h.from === entry.from && h.to === entry.to));
      const merged: JourneyEntry = {
        ...newEntry,
        searchCount: (existing?.searchCount ?? 0) + 1,
      };
      const updated = [merged, ...filtered].slice(0, 20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavorite = (entry: JourneyEntry) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.from === entry.from && f.to === entry.to);
      const updated = exists
        ? prev.filter((f) => !(f.from === entry.from && f.to === entry.to))
        : [{ ...entry, id: Date.now().toString() }, ...prev];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (from: string, to: string) =>
    favorites.some((f) => f.from === from && f.to === to);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return { favorites, history, addToHistory, toggleFavorite, isFavorite, clearHistory };
}

interface FavoritesHistoryPanelProps {
  favorites: JourneyEntry[];
  history: JourneyEntry[];
  onClearHistory: () => void;
  onToggleFavorite: (entry: JourneyEntry) => void;
  isFavorite: (from: string, to: string) => boolean;
}

function JourneyCard({
  entry,
  onFavorite,
  isFav,
  showTime = false,
}: {
  entry: JourneyEntry;
  onFavorite: () => void;
  isFav: boolean;
  showTime?: boolean;
}) {
  const [, setLocation] = useLocation();

  const go = () => {
    const params = new URLSearchParams({ from: entry.from, to: entry.to, date: entry.date });
    setLocation(`/results?${params.toString()}`);
  };

  return (
    <div className="group flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
      <div className="flex-1 min-w-0" onClick={go}>
        <div className="flex items-center gap-2 text-sm font-semibold truncate">
          <span className="truncate">{entry.fromLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{entry.toLabel}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {entry.fromUserLocation && (
            <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
              <MapPin className="w-3 h-3" /> From your location
            </span>
          )}
          {(entry.searchCount ?? 0) > 1 && (
            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
              <TrendingUp className="w-3 h-3" /> {entry.searchCount}x searched
            </span>
          )}
          {showTime && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {new Date(entry.searchedAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onFavorite(); }}
        className={cn(
          "shrink-0 p-1.5 rounded-lg transition-colors",
          isFav
            ? "text-secondary bg-secondary/10"
            : "text-muted-foreground hover:text-secondary opacity-0 group-hover:opacity-100"
        )}
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Star className={cn("w-4 h-4", isFav && "fill-secondary")} />
      </button>
    </div>
  );
}

export function FavoritesHistoryPanel({
  favorites,
  history,
  onClearHistory,
  onToggleFavorite,
  isFavorite,
}: FavoritesHistoryPanelProps) {
  const frequent = [...history]
    .filter((h) => (h.searchCount ?? 0) >= 2)
    .sort((a, b) => (b.searchCount ?? 0) - (a.searchCount ?? 0))
    .slice(0, 5);

  return (
    <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
      <Tabs defaultValue="history">
        <div className="px-4 pt-4 pb-0">
          <TabsList className="w-full">
            <TabsTrigger value="history" className="flex-1 gap-2">
              <History className="w-4 h-4" />
              History
              {history.length > 0 && (
                <span className="bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="frequent" className="flex-1 gap-2">
              <TrendingUp className="w-4 h-4" />
              Frequent
              {frequent.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                  {frequent.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1 gap-2">
              <Heart className="w-4 h-4" />
              Saved
              {favorites.length > 0 && (
                <span className="bg-secondary/20 text-secondary text-xs px-1.5 py-0.5 rounded-full">
                  {favorites.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="history" className="p-4 pt-3">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No recent searches yet.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {history.map((entry) => (
                  <JourneyCard
                    key={entry.id}
                    entry={entry}
                    onFavorite={() => onToggleFavorite(entry)}
                    isFav={isFavorite(entry.from, entry.to)}
                    showTime
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearHistory}
                className="mt-3 w-full text-muted-foreground hover:text-destructive gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </Button>
            </>
          )}
        </TabsContent>

        <TabsContent value="frequent" className="p-4 pt-3">
          {frequent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No repeated routes yet.</p>
              <p className="text-xs mt-1">Routes you search more than once will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {frequent.map((entry) => (
                <JourneyCard
                  key={entry.id}
                  entry={entry}
                  onFavorite={() => onToggleFavorite(entry)}
                  isFav={isFavorite(entry.from, entry.to)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="p-4 pt-3">
          {favorites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No saved journeys yet.</p>
              <p className="text-xs mt-1">Star a route from history to save it.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {favorites.map((entry) => (
                <JourneyCard
                  key={entry.id}
                  entry={entry}
                  onFavorite={() => onToggleFavorite(entry)}
                  isFav={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
