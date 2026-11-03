// Shared trip store — persisted to localStorage so User B (another tab) can read User A's data

export interface GpsPing {
  lng: number;
  lat: number;
  time: number; // ms since epoch
}

export interface TripState {
  active: boolean;
  fromId: string;
  toId: string;
  lineName: string;
  staticDurationMins: number; // timetable duration
  startedAt: number | null; // ms since epoch
  pings: GpsPing[];
  speedKmh: number | null;
  etaMins: number | null; // time to destination
  lastUpdated: number; // ms since epoch
}

const KEY = "nrc_trip_state";

const DEFAULT: TripState = {
  active: false,
  fromId: "",
  toId: "",
  lineName: "",
  staticDurationMins: 0,
  startedAt: null,
  pings: [],
  speedKmh: null,
  etaMins: null,
  lastUpdated: 0,
};

export function getTripState(): TripState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
  }
}

export function setTripState(state: TripState) {
  localStorage.setItem(KEY, JSON.stringify(state));
  // Notify same-tab listeners
  window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: JSON.stringify(state) }));
}

export function clearTripState() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: null }));
}

// Haversine distance in km between two lat/lng points
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
