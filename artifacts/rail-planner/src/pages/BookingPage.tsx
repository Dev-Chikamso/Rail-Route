import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Ticket, User, CreditCard, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { searchRoutes } from "@/lib/data";
import { formatTime, formatDuration } from "@/lib/utils";
import {
  SEAT_PRICES,
  generateRef,
  saveBooking,
  type SeatClass,
  type Passenger,
  type ConfirmedBooking,
} from "@/lib/bookingStore";

const CLASS_LABELS: Record<SeatClass, string> = {
  economy: "Economy",
  business: "Business",
  first: "First Class",
};

const CLASS_PERKS: Record<SeatClass, string> = {
  economy: "Standard seating, shared coach",
  business: "Reclining seats, AC coach",
  first: "Private cabin, meals included",
};

const STEPS = ["Route", "Passengers", "Payment", "Confirmed"] as const;
type Step = (typeof STEPS)[number];

export default function BookingPage() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const routeId = params.get("routeId");
  const from = params.get("from");
  const to = params.get("to");
  const dateStr = params.get("date") || new Date().toISOString().split("T")[0];

  const route = useMemo(() => {
    if (!from || !to) return null;
    const results = searchRoutes(from, to, new Date(dateStr));
    const all = results.fastest
      ? [results.fastest, ...results.alternatives]
      : results.alternatives;
    return all.find((r) => r.id === routeId) ?? all[0] ?? null;
  }, [from, to, dateStr, routeId]);

  const [step, setStep] = useState<Step>("Route");
  const [seatClass, setSeatClass] = useState<SeatClass>("economy");
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: "", age: "", gender: "male" },
  ]);
  const [paymentName, setPaymentName] = useState("");
  const [paymentCard, setPaymentCard] = useState("");
  const [paymentExpiry, setPaymentExpiry] = useState("");
  const [paymentCvv, setPaymentCvv] = useState("");
  const [confirmed, setConfirmed] = useState<ConfirmedBooking | null>(null);

  if (!route) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Route not found</h2>
        <Button onClick={() => setLocation("/")}>Back to Search</Button>
      </div>
    );
  }

  const pricePerSeat = SEAT_PRICES[seatClass];
  const total = pricePerSeat * passengers.length;

  const updatePassenger = (i: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  };

  const addPassenger = () =>
    setPassengers((prev) => [...prev, { name: "", age: "", gender: "male" }]);

  const removePassenger = (i: number) =>
    setPassengers((prev) => prev.filter((_, idx) => idx !== i));

  const passengersValid = passengers.every((p) => p.name.trim() && p.age.trim());
  const paymentValid =
    paymentName.trim() &&
    paymentCard.replace(/\s/g, "").length === 16 &&
    paymentExpiry.trim() &&
    paymentCvv.length >= 3;

  const handleConfirm = () => {
    const booking: ConfirmedBooking = {
      route,
      passengers,
      seatClass,
      date: dateStr,
      bookingRef: generateRef(),
      bookedAt: new Date().toISOString(),
      totalAmount: total,
    };
    saveBooking(booking);
    setConfirmed(booking);
    setStep("Confirmed");
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-4 sticky top-16 z-30 shadow-md">
        <div className="container mx-auto max-w-3xl">
          <Button
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 -ml-4 mb-3 h-8"
            onClick={() =>
              step === "Route"
                ? setLocation(`/results?from=${from}&to=${to}&date=${dateStr}`)
                : step === "Confirmed"
                ? setLocation("/tickets")
                : setStep(STEPS[stepIndex - 1])
            }
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === "Confirmed" ? "My Tickets" : step === "Route" ? "Back to Results" : "Back"}
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6" /> Book Ticket
          </h1>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-3">
            {STEPS.filter((s) => s !== "Confirmed").map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    stepIndex > i
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : stepIndex === i
                      ? "bg-primary-foreground text-primary border-primary-foreground"
                      : "bg-primary/40 text-primary-foreground/50 border-primary-foreground/30"
                  }`}
                >
                  {stepIndex > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    stepIndex === i ? "text-primary-foreground" : "text-primary-foreground/60"
                  }`}
                >
                  {s}
                </span>
                {i < 2 && <div className="w-6 h-px bg-primary-foreground/30" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 mt-8 space-y-6">
        {/* Route Summary (always visible) */}
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                {route.lineName} · {route.trainNumber}
              </p>
              <div className="flex items-center gap-3 text-lg font-bold">
                <span>{route.fromStation.name}</span>
                <ArrowLeft className="w-4 h-4 rotate-180 text-secondary" />
                <span>{route.toStation.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {formatTime(route.departureTime)} → {formatTime(route.arrivalTime)} ·{" "}
                {formatDuration(route.durationMinutes)}
              </p>
            </div>
            <Badge variant="outline" className="text-sm font-mono">
              {new Date(dateStr).toLocaleDateString("en-NG", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Badge>
          </div>
        </div>

        {/* STEP 1: Route / Class Selection */}
        {step === "Route" && (
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold">Select Seat Class</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(SEAT_PRICES) as SeatClass[]).map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSeatClass(cls)}
                  className={`border-2 rounded-xl p-4 text-left transition-all ${
                    seatClass === cls
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-bold text-base">{CLASS_LABELS[cls]}</div>
                  <div className="text-xs text-muted-foreground mt-1">{CLASS_PERKS[cls]}</div>
                  <div className="text-primary font-bold mt-3 text-lg">
                    ₦{SEAT_PRICES[cls].toLocaleString()}
                    <span className="text-xs text-muted-foreground font-normal"> /seat</span>
                  </div>
                </button>
              ))}
            </div>
            <Button
              className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
              onClick={() => setStep("Passengers")}
            >
              Continue to Passengers
            </Button>
          </div>
        )}

        {/* STEP 2: Passenger Details */}
        {step === "Passengers" && (
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5" /> Passenger Details
              </h2>
              <Button variant="outline" size="sm" onClick={addPassenger} className="gap-1">
                <Plus className="w-4 h-4" /> Add Passenger
              </Button>
            </div>

            {passengers.map((p, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3 relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Passenger {i + 1}
                  </span>
                  {passengers.length > 1 && (
                    <button
                      onClick={() => removePassenger(i)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Full Name</Label>
                    <Input
                      placeholder="e.g. Amaka Obi"
                      value={p.name}
                      onChange={(e) => updatePassenger(i, "name", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Age</Label>
                    <Input
                      placeholder="e.g. 28"
                      type="number"
                      min="1"
                      max="120"
                      value={p.age}
                      onChange={(e) => updatePassenger(i, "age", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Gender</Label>
                  <div className="flex gap-3 mt-1">
                    {(["male", "female", "other"] as const).map((g) => (
                      <label key={g} className="flex items-center gap-1.5 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name={`gender-${i}`}
                          value={g}
                          checked={p.gender === g}
                          onChange={() => updatePassenger(i, "gender", g)}
                          className="accent-primary"
                        />
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {passengers.length} passenger{passengers.length > 1 ? "s" : ""} ·{" "}
                  {CLASS_LABELS[seatClass]}
                </p>
                <p className="text-xl font-bold text-primary">₦{total.toLocaleString()}</p>
              </div>
              <Button
                className="h-12 px-8 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
                disabled={!passengersValid}
                onClick={() => setStep("Payment")}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment */}
        {step === "Payment" && (
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Payment Details
            </h2>
            <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-md p-3">
              🔒 This is a demo. No real payment is processed. Use any card details.
            </p>

            <div className="space-y-3">
              <div>
                <Label>Cardholder Name</Label>
                <Input
                  placeholder="Name on card"
                  value={paymentName}
                  onChange={(e) => setPaymentName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Card Number</Label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={paymentCard}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                    setPaymentCard(v.replace(/(.{4})/g, "$1 ").trim());
                  }}
                  className="mt-1 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Expiry (MM/YY)</Label>
                  <Input
                    placeholder="MM/YY"
                    maxLength={5}
                    value={paymentExpiry}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setPaymentExpiry(v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v);
                    }}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input
                    placeholder="123"
                    maxLength={4}
                    type="password"
                    value={paymentCvv}
                    onChange={(e) => setPaymentCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="mt-1 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {passengers.length} × {CLASS_LABELS[seatClass]}
                </span>
                <span>₦{(pricePerSeat * passengers.length).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₦{total.toLocaleString()}</span>
              </div>
              <Button
                className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold mt-2"
                disabled={!paymentValid}
                onClick={handleConfirm}
              >
                Pay ₦{total.toLocaleString()} & Confirm Booking
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Confirmed */}
        {step === "Confirmed" && confirmed && (
          <div className="bg-card border rounded-xl p-8 shadow-sm text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-700">Booking Confirmed!</h2>
              <p className="text-muted-foreground mt-1">
                Your tickets have been booked successfully.
              </p>
            </div>

            <div className="bg-muted rounded-xl p-5 text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Booking Reference</span>
                <span className="font-bold font-mono text-lg text-primary">
                  {confirmed.bookingRef}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Route</span>
                <span className="font-semibold text-sm">
                  {confirmed.route.fromStation.name} → {confirmed.route.toStation.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Train</span>
                <span className="font-semibold text-sm">{confirmed.route.trainNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Departure</span>
                <span className="font-semibold text-sm">
                  {formatTime(confirmed.route.departureTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Class</span>
                <span className="font-semibold text-sm">{CLASS_LABELS[confirmed.seatClass]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Passengers</span>
                <span className="font-semibold text-sm">{confirmed.passengers.length}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-bold">Amount Paid</span>
                <span className="font-bold text-primary">
                  ₦{confirmed.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3 flex-col sm:flex-row">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setLocation("/")}
              >
                Book Another Ticket
              </Button>
              <Button
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
                onClick={() => setLocation("/tickets")}
              >
                View My Tickets
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
