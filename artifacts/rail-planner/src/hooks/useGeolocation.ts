import { useState, useEffect } from "react";

export type GeoStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export interface GeoLocation {
  lat: number;
  lng: number;
  city: string | null;
  region: string | null;
  accuracy: number;
}

export interface UseGeolocationResult {
  status: GeoStatus;
  location: GeoLocation | null;
  error: string | null;
  request: () => void;
}

const CACHE_KEY = "nrc_geolocation";

function loadCache(): GeoLocation | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<{ city: string | null; region: string | null }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const addr = data.address ?? {};
    const city = addr.city ?? addr.town ?? addr.village ?? addr.county ?? null;
    const region = addr.state ?? null;
    return { city, region };
  } catch {
    return { city: null, region: null };
  }
}

export function useGeolocation(): UseGeolocationResult {
  const cached = loadCache();
  const [status, setStatus] = useState<GeoStatus>(cached ? "granted" : "idle");
  const [location, setLocation] = useState<GeoLocation | null>(cached);
  const [error, setError] = useState<string | null>(null);

  const request = () => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const { city, region } = await reverseGeocode(lat, lng);
        const loc: GeoLocation = { lat, lng, city, region, accuracy };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(loc));
        setLocation(loc);
        setStatus("granted");
      },
      (err) => {
        setStatus("denied");
        setError(
          err.code === 1
            ? "Location access was denied. Please allow location in your browser settings."
            : "Unable to determine your location. Please try again."
        );
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  };

  // Auto-request on first load if not yet decided
  useEffect(() => {
    if (cached) return;
    navigator.permissions?.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") request();
      else if (result.state === "denied") setStatus("denied");
      // if "prompt", wait for user to click
    }).catch(() => {
      // permissions API not available, wait for user action
    });
  }, []);

  return { status, location, error, request };
}

/** Returns the nearest LAMATA/NRC line name based on rough lat/lng bounding boxes */
export function getNearestLine(lat: number, lng: number): string | null {
  // Lagos bounding box
  if (lat >= 6.35 && lat <= 6.70 && lng >= 3.10 && lng <= 3.55) {
    // Blue Line corridor: roughly south Lagos, lat < 6.55
    if (lat < 6.55) return "LAMATA Blue Line";
    // Red Line corridor: north Lagos / Agbado area
    return "LAMATA Red Line";
  }
  if (lat >= 7.30 && lat <= 7.50 && lng >= 3.80 && lng <= 4.10) return "Lagos–Ibadan Line";
  if (lat >= 8.80 && lat <= 9.10 && lng >= 7.30 && lng <= 7.60) return "Abuja–Kaduna SGR";
  if (lat >= 11.90 && lat <= 12.10 && lng >= 8.40 && lng <= 8.60) return "Western Line (Kano)";
  if (lat >= 4.70 && lat <= 4.90 && lng >= 7.00 && lng <= 7.10) return "Eastern Line (Port Harcourt)";
  return null;
}
