import { Link, useLocation } from "wouter";
import { Train, Activity, Menu, X, Map } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { href: "/", label: "Plan Route", icon: Train },
    { href: "/status", label: "Status", icon: Activity },
    { href: "/map", label: "Live Map", icon: Map },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="NRC Logo" className="h-9 w-9 object-contain" />
          <span className="hidden sm:inline-block">
            Nigerian Railway <span className="text-secondary font-medium">Route Planner</span>
          </span>
          <span className="sm:hidden text-secondary">NR Planner</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || (href !== "/" && location.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-secondary ${
                  isActive
                    ? "text-secondary border-b-2 border-secondary pb-1 pt-1.5"
                    : "text-primary-foreground/80"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile */}
        <button
          className="md:hidden p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-primary-foreground/10 bg-primary px-4 py-4 space-y-1 shadow-lg">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || (href !== "/" && location.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
