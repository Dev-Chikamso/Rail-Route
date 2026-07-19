import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, Train, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
}

const AI_RESPONSES: Record<string, string> = {
  default:
    "I'm your NRC Rail Assistant! Ask me about train schedules, routes, delays, or tips for travelling across Nigeria. 🚂",
  delay:
    "Based on historical patterns, the Lagos–Ibadan corridor experiences delays most often on Monday mornings and Friday evenings due to high passenger volume. I'd recommend booking the 07:00 departure to avoid peak congestion.",
  fastest:
    "The fastest route between Lagos (Iddo) and Kaduna is via the Abuja–Kaduna Standard Gauge Line. Total journey: ~8h 30m with one connection at Idu Station, Abuja.",
  alternative:
    "If your preferred train is delayed, I suggest the next available departure within 2 hours. The Warri–Itakpe line also offers a scenic alternative for Delta/Kogi travellers.",
  book:
    "For ticket booking, I recommend visiting the NRC Breeze portal at nrc.gov.ng or the official NRC app. Tickets can also be purchased at any major station counter.",
  safe:
    "Nigerian Railway Corporation trains are generally safe. All standard gauge trains have CCTV, security personnel, and air conditioning. Keep your ticket and ID handy throughout the journey.",
  price:
    "Ticket prices vary by class and route. Lagos–Abuja economy class is approximately ₦6,500–₦9,000. Business class is around ₦12,000–₦15,000. Prices may change — always confirm at the station.",
  station:
    "Major NRC stations include: Iddo (Lagos), Idu (Abuja), Rigachikun (Kaduna), Warri, Itakpe, Port Harcourt Terminus, and Kano. Each has waiting areas, ticketing counters, and basic amenities.",
  time:
    "Most NRC trains depart in the early morning (06:00–09:00) and early afternoon (13:00–15:00). I recommend arriving at the station at least 30 minutes before departure.",
  luggage:
    "Each passenger is allowed up to 30kg of luggage free of charge. Excess baggage is charged per kg. Fragile or oversized items should be declared at the counter.",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("delay") || lower.includes("late")) return AI_RESPONSES.delay;
  if (lower.includes("fastest") || lower.includes("quick") || lower.includes("fast"))
    return AI_RESPONSES.fastest;
  if (lower.includes("alternative") || lower.includes("other route"))
    return AI_RESPONSES.alternative;
  if (lower.includes("book") || lower.includes("ticket") || lower.includes("buy"))
    return AI_RESPONSES.book;
  if (lower.includes("safe") || lower.includes("security")) return AI_RESPONSES.safe;
  if (lower.includes("price") || lower.includes("cost") || lower.includes("fare") || lower.includes("₦"))
    return AI_RESPONSES.price;
  if (lower.includes("station") || lower.includes("terminal")) return AI_RESPONSES.station;
  if (lower.includes("time") || lower.includes("depart") || lower.includes("schedule"))
    return AI_RESPONSES.time;
  if (lower.includes("luggage") || lower.includes("bag") || lower.includes("baggage"))
    return AI_RESPONSES.luggage;
  return AI_RESPONSES.default;
}

const QUICK_PROMPTS = [
  { label: "Fastest route?", icon: Train },
  { label: "Any delays today?", icon: Clock },
  { label: "How to book?", icon: MapPin },
];

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "ai",
      text: "👋 Hi! I'm your NRC Rail AI Assistant. Ask me anything about Nigerian train routes, schedules, or travel tips!",
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim(), time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const aiText = getAIResponse(text);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", text: aiText, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) },
      ]);
      setIsTyping(false);
    }, 900 + Math.random() * 600);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
          "bg-gradient-to-br from-primary to-emerald-700 text-white hover:scale-110 active:scale-95",
          open && "rotate-12"
        )}
        aria-label="Open AI Assistant"
      >
        {open ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full border-2 border-background animate-pulse" />
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-card border border-card-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-emerald-700 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">NRC Rail Assistant</p>
              <p className="text-white/70 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                AI-Powered · Mock Mode
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-72 min-h-[180px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                {msg.role === "ai" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  )}
                >
                  {msg.text}
                  <div className={cn("text-[10px] mt-1 opacity-60", msg.role === "user" ? "text-right" : "")}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {QUICK_PROMPTS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => sendMessage(label)}
                className="shrink-0 text-xs bg-muted hover:bg-primary/10 hover:text-primary border border-border px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask about routes, delays..."
              className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
