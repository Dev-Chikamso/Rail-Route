import { STATIONS, SYSTEM_STATUS } from "@/lib/data";
import { RouteSearchForm } from "@/components/RouteSearchForm";
import { FavoritesHistoryPanel, useFavoritesHistory } from "@/components/FavoritesHistory";
import { Clock, ShieldCheck, Map, ArrowRight, Radio, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function SearchPage() {
  const { favorites, history, addToHistory, toggleFavorite, isFavorite, clearHistory } = useFavoritesHistory();
  const { status: geoStatus, location } = useGeolocation();
  const isLive = false;

  const handleSearch = (from: string, to: string, date: string, fromUserLocation?: boolean) => {
    const fromStation = STATIONS.find((s) => s.id === from);
    const toStation = STATIONS.find((s) => s.id === to);
    if (!fromStation || !toStation) return;
    addToHistory({ from, to, fromLabel: fromStation.name, toLabel: toStation.name, date, fromUserLocation });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pb-12">
      <section className="bg-primary pt-16 pb-24 px-4 text-center text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/95" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <img src="/logo.png" alt="NRC Logo" className="h-20 w-20 object-contain drop-shadow-lg" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground px-3 py-1 bg-black/20 backdrop-blur-sm">
              <span className={`w-2 h-2 rounded-full mr-2 ${isLive ? "bg-green-400" : "bg-amber-400 animate-pulse"}`} />
              {isLive ? "Live Data Available" : "Static Schedule"}
            </Badge>
            {geoStatus === "granted" && location && (
              <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground px-3 py-1 bg-black/20 backdrop-blur-sm">
                <MapPin className="w-3 h-3 mr-1.5" />
                {location.city ?? "Location detected"}{location.region ? `, ${location.region}` : ""}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Plan your journey across Nigeria.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto font-medium">
            Fast, reliable train schedules for Lagos–Ibadan, Abuja–Kaduna, and more.
          </p>
          <div className="mt-8">
            <Link href="/map" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-secondary/90 transition-colors text-base">
              <Radio className="w-5 h-5 animate-pulse" />
              View Live Train Map
            </Link>
          </div>
        </div>
      </section>

      <div className="px-4">
        <RouteSearchForm onSearch={handleSearch} />
      </div>

      <div className="container mx-auto px-4 mt-10 max-w-5xl">
        {(history.length > 0 || favorites.length > 0) && (
          <div className="mb-10">
            <FavoritesHistoryPanel favorites={favorites} history={history} onClearHistory={clearHistory} onToggleFavorite={toggleFavorite} isFavorite={isFavorite} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border p-6 rounded-xl flex items-start gap-4 shadow-sm">
            <div className="bg-primary/10 p-3 rounded-lg text-primary"><Clock className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-lg mb-1">Accurate Timings</h3>
              <p className="text-muted-foreground text-sm">Schedule-based timings for all major NRC routes.</p>
            </div>
          </div>
          <div className="bg-card border p-6 rounded-xl flex items-start gap-4 shadow-sm">
            <div className="bg-primary/10 p-3 rounded-lg text-primary"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-lg mb-1">Official Data</h3>
              <p className="text-muted-foreground text-sm">Based on Nigerian Railway Corporation schedules.</p>
            </div>
          </div>
          <Link href="/map" className="bg-card border p-6 rounded-xl flex items-start gap-4 shadow-sm hover:border-primary transition-colors">
            <div className="bg-primary/10 p-3 rounded-lg text-primary"><Map className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-lg mb-1">Live Map</h3>
              <p className="text-muted-foreground text-sm">Track trains in real-time on the interactive map.</p>
            </div>
          </Link>
        </div>

        {/* LAMATA Lines */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-2">Lagos LAMATA Rail Lines</h2>
          <p className="text-muted-foreground text-sm mb-6">Urban rail services operated by the Lagos Metropolitan Area Transport Authority.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Blue Line */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-blue-600 text-white px-5 py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-lg">Blue Line</span>
                  <span className="ml-2 text-blue-100 text-sm">Marina – Okokomaiko</span>
                </div>
                <span className="bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full">16 Stations · 37 km</span>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {["Marina","National Theatre","Iganmu","Alaka","Surulere","Ojuelegba","Itire","Kilo","Ijesha","Oshodi","Isolo","Ikotun","Igando","Festac","Iyana-Iba","Okokomaiko"].map((s) => (
                    <span key={s} className="text-xs bg-blue-50 border border-blue-200 text-blue-800 px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
                <a href="/results?from=marina-blue&to=okokomaiko" className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Search Blue Line <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
            {/* Red Line */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-red-600 text-white px-5 py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-lg">Red Line</span>
                  <span className="ml-2 text-red-100 text-sm">Agbado – Marina</span>
                </div>
                <span className="bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full">8 Stations · 37 km</span>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {["Agbado","Iju","Agege","Ikeja","Mushin","Yaba","Ebute Metta","Marina"].map((s) => (
                    <span key={s} className="text-xs bg-red-50 border border-red-200 text-red-800 px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
                <a href="/results?from=agbado&to=marina-red" className="mt-4 flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">
                  Search Red Line <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Popular Routes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[["marina-blue","okokomaiko","Marina","Okokomaiko"],["agbado","marina-red","Agbado","Marina"],["iddo","ibadan","Lagos","Ibadan"],["idu","kaduna","Abuja","Kaduna"]].map(([from, to, fl, tl]) => (
              <a key={`${from}-${to}`} href={`/results?from=${from}&to=${to}`} className="bg-card border p-4 rounded-lg flex items-center justify-between hover:border-primary transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-semibold truncate">{fl}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-semibold truncate">{tl}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
