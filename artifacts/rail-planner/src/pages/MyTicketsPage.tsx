import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Ticket, ArrowLeft, Calendar, MapPin, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime, formatDuration } from "@/lib/utils";
import { getBookings, type ConfirmedBooking, type SeatClass } from "@/lib/bookingStore";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const CLASS_LABELS: Record<SeatClass, string> = {
  economy: "Economy",
  business: "Business",
  first: "First Class",
};

const CLASS_COLORS: Record<SeatClass, string> = {
  economy: "bg-blue-100 text-blue-800",
  business: "bg-purple-100 text-purple-800",
  first: "bg-amber-100 text-amber-800",
};

function TicketCard({ booking }: { booking: ConfirmedBooking }) {
  const [open, setOpen] = useState(false);
  const isPast = new Date(booking.date) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className={`bg-card border rounded-xl overflow-hidden shadow-sm ${isPast ? "opacity-70" : ""}`}>
      {/* Ticket top strip */}
      <div className="bg-primary/5 border-b px-5 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-primary" />
          <span className="font-bold font-mono text-primary">{booking.bookingRef}</span>
          {isPast && <Badge variant="outline" className="text-xs">Past</Badge>}
        </div>
        <span className="text-xs text-muted-foreground">
          Booked {new Date(booking.bookedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-xl font-bold mb-1">
              <span>{booking.route.fromStation.name}</span>
              <ArrowLeft className="w-4 h-4 rotate-180 text-secondary shrink-0" />
              <span>{booking.route.toStation.name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(booking.date).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}
              </span>
              <span>{formatTime(booking.route.departureTime)} → {formatTime(booking.route.arrivalTime)}</span>
              <span>{formatDuration(booking.route.durationMinutes)}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <Badge className={`${CLASS_COLORS[booking.seatClass]} border-transparent mb-1`}>
              {CLASS_LABELS[booking.seatClass]}
            </Badge>
            <div className="text-lg font-bold text-primary">₦{booking.totalAmount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{booking.passengers.length} passenger{booking.passengers.length > 1 ? "s" : ""}</div>
          </div>
        </div>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="mt-3 text-muted-foreground hover:text-foreground gap-1 -ml-2">
              Passenger Details
              <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-muted-foreground">#</th>
                    <th className="text-left px-4 py-2 font-semibold text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-2 font-semibold text-muted-foreground">Age</th>
                    <th className="text-left px-4 py-2 font-semibold text-muted-foreground">Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.passengers.map((p, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-2 font-medium">{p.name}</td>
                      <td className="px-4 py-2">{p.age}</td>
                      <td className="px-4 py-2 capitalize">{p.gender}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Dashed divider (ticket stub effect) */}
      <div className="border-t border-dashed mx-5" />
      <div className="px-5 py-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Platform {booking.route.platform ?? "TBA"}
        </span>
        <span className="font-mono">{booking.route.trainNumber}</span>
      </div>
    </div>
  );
}

export default function MyTicketsPage() {
  const [, setLocation] = useLocation();
  const [bookings, setBookings] = useState<ConfirmedBooking[]>([]);

  useEffect(() => {
    setBookings(getBookings());
  }, []);

  const upcoming = bookings.filter((b) => new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0)));
  const past = bookings.filter((b) => new Date(b.date) < new Date(new Date().setHours(0, 0, 0, 0)));

  const clearAll = () => {
    localStorage.removeItem("nrc_bookings");
    setBookings([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-primary text-primary-foreground py-8 px-4 sticky top-16 z-30 shadow-md">
        <div className="container mx-auto max-w-3xl">
          <Button
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 -ml-4 mb-3 h-8"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Home
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Ticket className="w-6 h-6" /> My Tickets
            </h1>
            {bookings.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 gap-1"
                onClick={clearAll}
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 mt-8 space-y-8">
        {bookings.length === 0 ? (
          <div className="bg-card border rounded-xl p-12 text-center shadow-sm">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No tickets yet</h2>
            <p className="text-muted-foreground mb-6">Book a train ticket to see it here.</p>
            <Button
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
              onClick={() => setLocation("/")}
            >
              Search Trains
            </Button>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4">Upcoming ({upcoming.length})</h2>
                <div className="space-y-4">
                  {upcoming.map((b) => (
                    <TicketCard key={b.bookingRef} booking={b} />
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 text-muted-foreground">Past ({past.length})</h2>
                <div className="space-y-4">
                  {past.map((b) => (
                    <TicketCard key={b.bookingRef} booking={b} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
