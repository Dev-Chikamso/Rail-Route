import { useState, useEffect, useRef, useCallback } from "react";
import { getTripState, setTripState, clearTripState, haversineKm, TripState, GpsPing } from "@/lib/tripStore";

// Station coords (subset — same as useLiveTrains)
const STATION_COORDS: Record<string, [number, number]> = {
  iddo: [6.4698, 3.3852],
  "ebute-metta": [6.4833, 3.3667],
  agege: [6.6167, 3.3167],
  iju: [6.6333, 3.2833],
  agbado: [6.6667, 3.2167],
  abeokuta: [7.1557, 3.3451],
  ibadan: [7.3775, 3.947],
  ilorin: [8.4966, 4.5426],
  jebba: [9.1333, 4.8167],
  minna: [9.6139, 6.5569],
  kaduna: [10.5264, 7.4382],
  zaria: [11.0667, 7.7],
  kano: [12.0022, 8.592],
  idu: [9.0333, 7.4167],
  rigachikun: [10.6167, 7.3167],
  "ph-port-harcourt": [4.8156, 7.0498],
  aba: [5.1066, 7.3667],
  enugu: [6.4584, 7.5464],
  warri: [5.5167, 5.75],
  sapele: [5.8833, 5.6833],
  "benin-city": [6.335, 5.6037],
  apapa: [6.45, 3.3667],
  "marina-blue": [6.4474, 3.3903],
  "marina-red": [6.4474, 3.3903],
  "national-theatre": [6.4531, 3.3764],
  iganmu: [6.4667, 3.3583],
  alaka: [6.4833, 3.3583],
  surulere: [6.4972, 3.3528],
  ojuelegba: [6.5028, 3.3583],
  itire: [6.5167, 3.3417],
  kilo: [6.5333, 3.3333],
  ijesha: [6.5417, 3.3167],
  oshodi: [6.5556, 3.3167],
  isolo: [6.5333, 3.3],
  ikotun: [6.5167, 3.2833],
  igando: [6.5, 3.2667],
  festac: [6.4667, 3.2667],
  "iyana-iba": [6.45, 3.2333],
  okokomaiko: [6.4333, 3.2],
  ikeja: [6.6, 3.35],
  mushin: [6.5333, 3.3583],
  yaba: [6.5, 3.3833],
};

export function getStationCoords(id: string): [number, number] | null {
  return STATION_COORDS[id] ?? null;
}

export interface TripTrackerState {
  trip: TripState;
  geoError: string | null;
  isTracking: boolean;
  startTrip: (fromId: string, toId: string, lineName: string, staticDurationMins: number) => void;
  stopTrip: () => void;
}

const INTERVAL_MS = 30_000; // 30 seconds between GPS pings

export function useTripTracker(): TripTrackerState {
  const [trip, setTrip] = useState<TripState>(getTripState);
  const [geoError, setGeoError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync from storage (cross-tab)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "nrc_trip_state") {
        setTrip(getTripState());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const collectPing = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoError(null);
        const newPing: GpsPing = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          time: Date.now(),
        };

        const current = getTripState();
        if (!current.active) return;

        const pings = [...current.pings, newPing];

        // Speed: use last 2 pings
        let speedKmh: number | null = current.speedKmh;
        if (pings.length >= 2) {
          const p1 = pings[pings.length - 2];
          const p2 = pings[pings.length - 1];
          const distKm = haversineKm(p1.lat, p1.lng, p2.lat, p2.lng);
          const timeDiffHrs = (p2.time - p1.time) / 3_600_000;
          speedKmh = timeDiffHrs > 0 ? distKm / timeDiffHrs : speedKmh;
        }

        // ETA: distance from last ping to destination / speed
        let etaMins: number | null = null;
        const destCoords = STATION_COORDS[current.toId];
        if (destCoords && speedKmh && speedKmh > 0) {
          const last = pings[pings.length - 1];
          const distToDestKm = haversineKm(last.lat, last.lng, destCoords[0], destCoords[1]);
          etaMins = Math.round((distToDestKm / speedKmh) * 60);
        }

        const updated: TripState = { ...current, pings, speedKmh, etaMins, lastUpdated: Date.now() };
        setTripState(updated);
        setTrip(updated);
      },
      (err) => setGeoError(err.message),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, []);

  const startTrip = useCallback(
    (fromId: string, toId: string, lineName: string, staticDurationMins: number) => {
      const state: TripState = {
        active: true,
        fromId,
        toId,
        lineName,
        staticDurationMins,
        startedAt: Date.now(),
        pings: [],
        speedKmh: null,
        etaMins: null,
        lastUpdated: Date.now(),
      };
      setTripState(state);
      setTrip(state);
      collectPing(); // immediate first ping
      intervalRef.current = setInterval(collectPing, INTERVAL_MS);
    },
    [collectPing]
  );

  const stopTrip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    clearTripState();
    const cleared = getTripState();
    setTrip(cleared);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return { trip, geoError, isTracking: trip.active, startTrip, stopTrip };
}
