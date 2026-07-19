import { useState, useEffect } from "react";

export interface LiveTrain {
  id: string;
  name: string;
  trainNumber: string;
  fromId: string;
  toId: string;
  allStopIds: string[];
  departureMinutes: number; // minutes from midnight
  durationMinutes: number;
  status: "on-time" | "delayed" | "completed" | "not-started";
  progressPct: number; // 0–100
  currentLat: number;
  currentLng: number;
  prevStationName: string;
  nextStationName: string;
  delayMinutes: number;
}

// Must match STATION_COORDS in MapTracker
const COORDS: Record<string, [number, number]> = {
  iddo: [6.4698, 3.3852],
  "ebute-metta": [6.4833, 3.3667],
  agege: [6.6167, 3.3167],
  iju: [6.6333, 3.2833],
  agbado: [6.6667, 3.2167],
  abeokuta: [7.1557, 3.3451],
  ibadan: [7.3775, 3.947],
  offa: [8.15, 4.7167],
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
  makurdi: [7.7333, 8.5333],
  warri: [5.5167, 5.75],
  sapele: [5.8833, 5.6833],
  "benin-city": [6.335, 5.6037],
  apapa: [6.45, 3.3667],
};

const STATION_NAMES: Record<string, string> = {
  iddo: "Iddo Terminal",
  "ebute-metta": "Ebute Metta",
  agege: "Agege",
  iju: "Iju",
  agbado: "Agbado",
  abeokuta: "Abeokuta",
  ibadan: "Ibadan",
  offa: "Offa",
  ilorin: "Ilorin",
  jebba: "Jebba",
  minna: "Minna",
  kaduna: "Kaduna",
  zaria: "Zaria",
  kano: "Kano",
  idu: "Idu (Abuja)",
  rigachikun: "Rigachikun",
  "ph-port-harcourt": "Port Harcourt",
  aba: "Aba",
  enugu: "Enugu",
  makurdi: "Makurdi",
  warri: "Warri",
  sapele: "Sapele",
  "benin-city": "Benin City",
  apapa: "Apapa",
};

// Timetable entries — mirrors api-server timetable
const TIMETABLE = [
  {
    id: "wl-lb-01",
    name: "Lagos–Ibadan Commuter",
    trainNumber: "NRC 101",
    fromId: "iddo",
    toId: "ibadan",
    allStopIds: ["iddo", "ebute-metta", "agege", "iju", "agbado", "abeokuta", "ibadan"],
    departureMinutes: 6 * 60,
    durationMinutes: 4 * 60 + 30,
    delayMinutes: 0,
  },
  {
    id: "wl-lb-02",
    name: "Lagos–Ibadan Express",
    trainNumber: "NRC 103",
    fromId: "iddo",
    toId: "ibadan",
    allStopIds: ["iddo", "ebute-metta", "abeokuta", "ibadan"],
    departureMinutes: 10 * 60,
    durationMinutes: 3 * 60 + 30,
    delayMinutes: 0,
  },
  {
    id: "akg-01",
    name: "Abuja–Kaduna SGR",
    trainNumber: "NRC 201",
    fromId: "idu",
    toId: "kaduna",
    allStopIds: ["idu", "rigachikun", "kaduna"],
    departureMinutes: 7 * 60,
    durationMinutes: 2 * 60,
    delayMinutes: 0,
  },
  {
    id: "akg-02",
    name: "Abuja–Kaduna SGR",
    trainNumber: "NRC 203",
    fromId: "idu",
    toId: "kaduna",
    allStopIds: ["idu", "rigachikun", "kaduna"],
    departureMinutes: 14 * 60,
    durationMinutes: 2 * 60,
    delayMinutes: 0,
  },
  {
    id: "akg-03",
    name: "Kaduna–Abuja SGR",
    trainNumber: "NRC 202",
    fromId: "kaduna",
    toId: "idu",
    allStopIds: ["kaduna", "rigachikun", "idu"],
    departureMinutes: 9 * 60,
    durationMinutes: 2 * 60,
    delayMinutes: 0,
  },
  {
    id: "wl-01",
    name: "Western Line Express",
    trainNumber: "NRC 001",
    fromId: "iddo",
    toId: "kano",
    allStopIds: ["iddo", "ebute-metta", "agege", "abeokuta", "ibadan", "ilorin", "jebba", "minna", "kaduna", "zaria", "kano"],
    departureMinutes: 7 * 60,
    durationMinutes: 19 * 60,
    delayMinutes: 0,
  },
  {
    id: "wbl-01",
    name: "Warri–Lagos Line",
    trainNumber: "NRC 301",
    fromId: "warri",
    toId: "iddo",
    allStopIds: ["warri", "sapele", "benin-city", "iddo"],
    departureMinutes: 6 * 60,
    durationMinutes: 10 * 60,
    delayMinutes: 0,
  },
  {
    id: "el-ph-en-01",
    name: "Eastern Line Express",
    trainNumber: "NRC 401",
    fromId: "ph-port-harcourt",
    toId: "enugu",
    allStopIds: ["ph-port-harcourt", "aba", "enugu"],
    departureMinutes: 8 * 60,
    durationMinutes: 6 * 60,
    delayMinutes: 0,
  },
];

function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
}

// Interpolate lat/lng between two coords at ratio t (0–1)
function interpolate(a: [number, number], b: [number, number], t: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function computeTrain(entry: (typeof TIMETABLE)[0]): LiveTrain {
  const now = nowMinutes();
  const effectiveDep = entry.departureMinutes + entry.delayMinutes;
  const elapsed = now - effectiveDep;

  if (elapsed < 0) {
    const c = COORDS[entry.fromId] ?? [9.082, 8.6753];
    return {
      id: entry.id,
      name: entry.name,
      trainNumber: entry.trainNumber,
      fromId: entry.fromId,
      toId: entry.toId,
      allStopIds: entry.allStopIds,
      departureMinutes: entry.departureMinutes,
      durationMinutes: entry.durationMinutes,
      status: "not-started",
      progressPct: 0,
      currentLat: c[0],
      currentLng: c[1],
      prevStationName: "",
      nextStationName: STATION_NAMES[entry.fromId] ?? entry.fromId,
      delayMinutes: entry.delayMinutes,
    };
  }

  if (elapsed >= entry.durationMinutes) {
    const c = COORDS[entry.toId] ?? [9.082, 8.6753];
    return {
      id: entry.id,
      name: entry.name,
      trainNumber: entry.trainNumber,
      fromId: entry.fromId,
      toId: entry.toId,
      allStopIds: entry.allStopIds,
      departureMinutes: entry.departureMinutes,
      durationMinutes: entry.durationMinutes,
      status: "completed",
      progressPct: 100,
      currentLat: c[0],
      currentLng: c[1],
      prevStationName: STATION_NAMES[entry.toId] ?? entry.toId,
      nextStationName: "",
      delayMinutes: entry.delayMinutes,
    };
  }

  const progressPct = (elapsed / entry.durationMinutes) * 100;
  const stops = entry.allStopIds;
  const segmentCount = stops.length - 1;
  const segmentProgress = progressPct / 100 * segmentCount;
  const segIdx = Math.min(Math.floor(segmentProgress), segmentCount - 1);
  const segT = segmentProgress - segIdx;

  const fromCoord = COORDS[stops[segIdx]] ?? [9.082, 8.6753];
  const toCoord = COORDS[stops[segIdx + 1]] ?? [9.082, 8.6753];
  const [lat, lng] = interpolate(fromCoord, toCoord, segT);

  return {
    id: entry.id,
    name: entry.name,
    trainNumber: entry.trainNumber,
    fromId: entry.fromId,
    toId: entry.toId,
    allStopIds: entry.allStopIds,
    departureMinutes: entry.departureMinutes,
    durationMinutes: entry.durationMinutes,
    status: entry.delayMinutes > 0 ? "delayed" : "on-time",
    progressPct: Math.round(progressPct),
    currentLat: lat,
    currentLng: lng,
    prevStationName: STATION_NAMES[stops[segIdx]] ?? stops[segIdx],
    nextStationName: STATION_NAMES[stops[segIdx + 1]] ?? stops[segIdx + 1],
    delayMinutes: entry.delayMinutes,
  };
}

export function useLiveTrains(intervalMs = 30000) {
  const [trains, setTrains] = useState<LiveTrain[]>(() =>
    TIMETABLE.map(computeTrain)
  );

  useEffect(() => {
    const tick = () => setTrains(TIMETABLE.map(computeTrain));
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return trains;
}
