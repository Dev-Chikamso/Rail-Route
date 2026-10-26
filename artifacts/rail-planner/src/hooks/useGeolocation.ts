import { useState, useEffect } from "react";

export type GeoStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export interface GeoLocation {
  lat: number;
  lng: number;
  city: string | null;
  region: string | null;
  accuracy: number;
  capturedAt: string;
}

export interface UseGeolocationResult {
  status: GeoStatus;
  location: GeoLocation | null;
  error: string | null;
  request: () => void;
}

const SESSION_KEY = "nrc_geolocation";
const PERSIST_KEY = "nrc_geolocation_persist";

// Station coordinates for nearest-station matching
const STATION_COORDS: { id: string; name: string; lat: number; lng: number }[] = [
  { id: "marina-blue",      name: "Marina (Blue Line)",     lat: 6.4510, lng: 3.3958 },
  { id: "marina-red",       name: "Marina (Red Line)",      lat: 6.4510, lng: 3.3958 },
  { id: "national-theatre", name: "National Theatre",       lat: 6.4698, lng: 3.3772 },
  { id: "iganmu",           name: "Iganmu",                 lat: 6.4750, lng: 3.3600 },
  { id: "alaka",            name: "Alaka",                  lat: 6.4850, lng: 3.3500 },
  { id: "surulere",         name: "Surulere",               lat: 6.4969, lng: 3.3515 },
  { id: "ojuelegba",        name: "Ojuelegba",              lat: 6.5050, lng: 3.3600 },
  { id: "itire",            name: "Itire",                  lat: 6.5100, lng: 3.3450 },
  { id: "kilo",             name: "Kilo",                   lat: 6.5150, lng: 3.3350 },
  { id: "ijesha",           name: "Ijesha",                 lat: 6.5200, lng: 3.3250 },
  { id: "oshodi",           name: "Oshodi",                 lat: 6.5567, lng: 3.3350 },
  { id: "isolo",            name: "Isolo",                  lat: 6.5350, lng: 3.3100 },
  { id: "ikotun",           name: "Ikotun",                 lat: 6.5200, lng: 3.2900 },
  { id: "igando",           name: "Igando",                 lat: 6.5100, lng: 3.2700 },
  { id: "festac",           name: "Festac",                 lat: 6.4700, lng: 3.2700 },
  { id: "iyana-iba",        name: "Iyana-Iba",              lat: 6.4600, lng: 3.2200 },
  { id: "okokomaiko",       name: "Okokomaiko",             lat: 6.4500, lng: 3.1800 },
  { id: "agbado",           name: "Agbado",                 lat: 6.6500, lng: 3.2500 },
  { id: "iju",              name: "Iju",                    lat: 6.6200, lng: 3.2800 },
  { id: "agege",            name: "Agege",                  lat: 6.6167, lng: 3.3167 },
  { id: "ikeja",            name: "Ikeja",                  lat: 6.5954, lng: 3.3378 },
  { id: "mushin",           name: "Mushin",                 lat: 6.5350, lng: 3.3550 },
  { id: "yaba",             name: "Yaba",                   lat: 6.5050, lng: 3.3750 },
  { id: "ebute-metta",      name: "Ebute Metta",            lat: 6.4900, lng: 3.3800 },
  { id: "iddo",             name: "Iddo Terminal",          lat: 6.4698, lng: 3.3900 },
  { id: "apapa",            name: "Apapa",                  lat: 6.4500, lng: 3.3600 },
  { id: "idu",              name: "Idu Station (Abuja)",    lat: 9.0200, lng: 7.4500 },
  { id: "kaduna",           name: "Kaduna",                 lat: 10.5264, lng: 7.4382 },
  { id: "kano",             name: "Kano",                   lat: 12.0022, lng: 8.5920 },
  { id: "ibadan",           name: "Ibadan",                 lat: 7.3775, lng: 3.9470 },
  { id: "ph-port-harcourt", name: "Port Harcourt",          lat: 4.8156, lng: 7.0498 },
  { id: "warri",            name: "Warri",                  lat: 5.5167, lng: 5.7500 },
  { id: "enugu",            name: "Enugu",                  lat: 6.4584, lng: 7.5464 },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearestStation(lat: number, lng: number): { id: string; name: string; distanceKm: number } | null {
  let nearest = null;
  let minDist = Infinity;
  for (const s of STATION_COORDS) {
    const d = haversineKm(lat, lng, s.lat, s.lng);
    if (d < minDist) { minDist = d; nearest = s; }
  }
  return nearest ? { id: nearest.id, name: nearest.name, distanceKm: Math.round(minDist * 10) / 10 } : null;
}

function loadCache(): GeoLocation | null {
  try {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) return JSON.parse(session);
    const persisted = localStorage.getItem(PERSIST_KEY);
    return persisted ? JSON.parse(persisted) : null;
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
        const loc: GeoLocation = { lat, lng, city, region, accuracy, capturedAt: new Date().toISOString() };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(loc));
        localStorage.setItem(PERSIST_KEY, JSON.stringify(loc));
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

  useEffect(() => {
    if (cached) return;
    navigator.permissions?.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") request();
      else if (result.state === "denied") setStatus("denied");
    }).catch(() => {});
  }, []);

  return { status, location, error, request };
}

/** Returns the nearest LAMATA/NRC line name based on rough lat/lng bounding boxes */
export function getNearestLine(lat: number, lng: number): string | null {
  if (lat >= 6.35 && lat <= 6.70 && lng >= 3.10 && lng <= 3.55) {
    if (lat < 6.55) return "LAMATA Blue Line";
    return "LAMATA Red Line";
  }
  if (lat >= 7.30 && lat <= 7.50 && lng >= 3.80 && lng <= 4.10) return "Lagos–Ibadan Line";
  if (lat >= 8.80 && lat <= 9.10 && lng >= 7.30 && lng <= 7.60) return "Abuja–Kaduna SGR";
  if (lat >= 11.90 && lat <= 12.10 && lng >= 8.40 && lng <= 8.60) return "Western Line (Kano)";
  if (lat >= 4.70 && lat <= 4.90 && lng >= 7.00 && lng <= 7.10) return "Eastern Line (Port Harcourt)";
  return null;
}
