import { Navbar } from "@/components/Navbar";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import SearchPage from '@/pages/SearchPage';
import ResultsPage from '@/pages/ResultsPage';
import StatusPage from '@/pages/StatusPage';
import MapPage from '@/pages/MapPage';
import NotFound from '@/pages/not-found';
import { AIChatWidget } from '@/components/AIChatWidget';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function Router() {
  // Always force light mode
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("nrc_theme");
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={SearchPage} />
          <Route path="/results" component={ResultsPage} />
          <Route path="/status" component={StatusPage} />
          <Route path="/map" component={MapPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <footer className="border-t py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Nigerian Railway Route Planner. Unofficial utility app.</p>
        </div>
      </footer>
      <AIChatWidget />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
