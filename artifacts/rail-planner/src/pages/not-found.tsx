import { Link } from "wouter";
import { AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-background px-4">
      <div className="text-center max-w-md">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground mb-4">
          Off the Rails
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          The page you're looking for has been delayed indefinitely, cancelled, or never existed in the schedule.
        </p>
        <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-base">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            Return to Station
          </Link>
        </Button>
      </div>
    </div>
  );
}
