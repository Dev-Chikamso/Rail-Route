import { useGetSystemStatus } from "@workspace/api-client-react";
import { RouteSearchForm } from "@/components/RouteSearchForm";
import { Clock, ShieldCheck, Map, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const { data: statusData, isLoading: isLoadingStatus } = useGetSystemStatus();

  const isLive = statusData?.dataSources.some((s) => s.name === "NRC Live API" && s.available);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pb-12">
      {/* Hero Section */}
      <section className="bg-primary pt-16 pb-24 px-4 text-center text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-primary/90"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            {isLoadingStatus ? (
              <Skeleton className="h-6 w-32 bg-primary-foreground/20" />
            ) : (
              <Badge variant="outline" className={`border-primary-foreground/30 text-primary-foreground px-3 py-1 bg-black/20 backdrop-blur-sm`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-green-400' : 'bg-amber-400 animate-pulse'}`}></span>
                {isLive ? 'Live Data Available' : 'Static Schedule Fallback'}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Plan your journey across Nigeria.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto font-medium">
            Fast, reliable train schedules and real-time disruptions for Lagos-Ibadan, Abuja-Kaduna, and more.
          </p>
        </div>
      </section>

      {/* Search Form - overlaps hero */}
      <div className="px-4">
        <RouteSearchForm />
      </div>

      {/* Info Cards */}
      <div className="container mx-auto px-4 mt-20 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border p-6 rounded-xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-lg text-primary">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Accurate Timings</h3>
              <p className="text-muted-foreground text-sm">Real-time status updates when available, ensuring you never miss your train.</p>
            </div>
          </div>
          
          <div className="bg-card border p-6 rounded-xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-lg text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Official Data</h3>
              <p className="text-muted-foreground text-sm">Sourced directly from Nigerian Railway Corporation schedules and APIs.</p>
            </div>
          </div>

          <div className="bg-card border p-6 rounded-xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-lg text-primary">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">All Major Routes</h3>
              <p className="text-muted-foreground text-sm">Covering standard gauge and narrow gauge lines across the country.</p>
            </div>
          </div>
        </div>

        {/* Popular Routes */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Popular Routes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {['Lagos', 'Ibadan', 'Abuja', 'Kaduna'].map((city, i, arr) => {
              if (i % 2 !== 0) return null;
              const nextCity = arr[i+1];
              if (!nextCity) return null;
              return (
                <a 
                  key={city}
                  href={`/results?from=${city.toLowerCase()}&to=${nextCity.toLowerCase()}`}
                  className="bg-card border p-4 rounded-lg flex items-center justify-between group hover:border-primary transition-colors hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{city}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{nextCity}</span>
                  </div>
                </a>
              );
            })}
             {['Warri', 'Itakpe', 'Port Harcourt', 'Aba'].map((city, i, arr) => {
              if (i % 2 !== 0) return null;
              const nextCity = arr[i+1];
              if (!nextCity) return null;
              return (
                <a 
                  key={city}
                  href={`/results?from=${city.toLowerCase()}&to=${nextCity.toLowerCase()}`}
                  className="bg-card border p-4 rounded-lg flex items-center justify-between group hover:border-primary transition-colors hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{city}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{nextCity}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
