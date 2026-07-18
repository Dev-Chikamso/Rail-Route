import { STATIONS, type Station } from "./stations";

export type RouteStatus = "on-time" | "delayed" | "disrupted" | "cancelled";
export type DataSource = "live" | "static-fallback";

export interface Stop {
  stationId: string;
  stationName: string;
  arrivalTime: string | null;
  departureTime: string | null;
  platform: string | null;
}

export interface TrainRoute {
  id: string;
  lineName: string;
  trainNumber: string | null;
  fromStation: Station;
  toStation: Station;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: Stop[];
  status: RouteStatus;
  delayMinutes: number;
  disruptions: string | null;
  platform: string | null;
  dataSource: DataSource;
}

function stationById(id: string): Station {
  const s = STATIONS.find((s) => s.id === id);
  if (!s) throw new Error(`Unknown station: ${id}`);
  return s;
}

// Compute departure/arrival times relative to a base date
function addMinutes(base: Date, minutes: number): string {
  const d = new Date(base.getTime() + minutes * 60_000);
  return d.toISOString();
}

// Randomly add realistic delays for some services (deterministic based on date)
function simulateStatus(seed: number): { status: RouteStatus; delayMinutes: number; disruptions: string | null } {
  const r = ((seed * 1103515245 + 12345) & 0x7fffffff) % 100;
  if (r < 60) return { status: "on-time", delayMinutes: 0, disruptions: null };
  if (r < 80) return { status: "delayed", delayMinutes: 15 + (r % 4) * 10, disruptions: `Train delayed by approximately ${15 + (r % 4) * 10} minutes due to signal checks.` };
  if (r < 90) return { status: "delayed", delayMinutes: 45, disruptions: "Train delayed 45 minutes due to track maintenance works." };
  if (r < 96) return { status: "disrupted", delayMinutes: 0, disruptions: "Service disrupted. Engineering works in progress. Seek alternative." };
  return { status: "on-time", delayMinutes: 0, disruptions: null };
}

export interface TimetableEntry {
  id: string;
  lineName: string;
  trainNumber: string;
  fromId: string;
  toId: string;
  intermediateStopIds: string[];
  // minutes from midnight
  departureMinutes: number;
  // total duration minutes
  durationMinutes: number;
  platform: string;
}

// Static Nigerian Railway timetable
export const TIMETABLE: TimetableEntry[] = [
  // Western Line: Lagos (Iddo) → Kano
  {
    id: "wl-01",
    lineName: "Western Line Express",
    trainNumber: "NRC 001",
    fromId: "iddo",
    toId: "kano",
    intermediateStopIds: ["ebute-metta", "agege", "abeokuta", "ibadan", "ilorin", "jebba", "minna", "kaduna", "zaria"],
    departureMinutes: 7 * 60, // 07:00
    durationMinutes: 19 * 60, // 19 hours
    platform: "1",
  },
  {
    id: "wl-02",
    lineName: "Western Line Passenger",
    trainNumber: "NRC 003",
    fromId: "iddo",
    toId: "kano",
    intermediateStopIds: ["ebute-metta", "agbado", "abeokuta", "ibadan", "offa", "ilorin", "jebba", "minna", "zaria", "kaduna"],
    departureMinutes: 19 * 60, // 19:00
    durationMinutes: 22 * 60, // 22 hours
    platform: "2",
  },
  // Lagos → Ibadan (shorter segment)
  {
    id: "wl-lb-01",
    lineName: "Lagos–Ibadan Commuter",
    trainNumber: "NRC 101",
    fromId: "iddo",
    toId: "ibadan",
    intermediateStopIds: ["ebute-metta", "agege", "iju", "agbado", "abeokuta"],
    departureMinutes: 6 * 60, // 06:00
    durationMinutes: 4 * 60 + 30, // 4h 30m
    platform: "3",
  },
  {
    id: "wl-lb-02",
    lineName: "Lagos–Ibadan Express",
    trainNumber: "NRC 103",
    fromId: "iddo",
    toId: "ibadan",
    intermediateStopIds: ["ebute-metta", "abeokuta"],
    departureMinutes: 10 * 60, // 10:00
    durationMinutes: 3 * 60 + 30, // 3h 30m
    platform: "1",
  },
  // Ibadan → Lagos
  {
    id: "wl-bl-01",
    lineName: "Ibadan–Lagos Commuter",
    trainNumber: "NRC 102",
    fromId: "ibadan",
    toId: "iddo",
    intermediateStopIds: ["abeokuta", "agbado", "iju", "agege", "ebute-metta"],
    departureMinutes: 6 * 60 + 30, // 06:30
    durationMinutes: 4 * 60 + 30,
    platform: "2",
  },
  {
    id: "wl-bl-02",
    lineName: "Ibadan–Lagos Express",
    trainNumber: "NRC 104",
    fromId: "ibadan",
    toId: "iddo",
    intermediateStopIds: ["abeokuta", "ebute-metta"],
    departureMinutes: 14 * 60, // 14:00
    durationMinutes: 3 * 60 + 30,
    platform: "1",
  },
  // Kano → Lagos (reverse)
  {
    id: "wl-kl-01",
    lineName: "Western Line Express",
    trainNumber: "NRC 002",
    fromId: "kano",
    toId: "iddo",
    intermediateStopIds: ["zaria", "kaduna", "minna", "jebba", "ilorin", "ibadan", "abeokuta", "ebute-metta"],
    departureMinutes: 7 * 60,
    durationMinutes: 19 * 60,
    platform: "1",
  },
  // Abuja–Kaduna Standard Gauge
  {
    id: "akg-01",
    lineName: "Abuja–Kaduna SGR",
    trainNumber: "NRC 201",
    fromId: "idu",
    toId: "kaduna",
    intermediateStopIds: ["rigachikun"],
    departureMinutes: 7 * 60, // 07:00
    durationMinutes: 2 * 60, // 2 hours
    platform: "A",
  },
  {
    id: "akg-02",
    lineName: "Abuja–Kaduna SGR",
    trainNumber: "NRC 203",
    fromId: "idu",
    toId: "kaduna",
    intermediateStopIds: ["rigachikun"],
    departureMinutes: 14 * 60, // 14:00
    durationMinutes: 2 * 60,
    platform: "B",
  },
  {
    id: "akg-03",
    lineName: "Abuja–Kaduna SGR",
    trainNumber: "NRC 202",
    fromId: "kaduna",
    toId: "idu",
    intermediateStopIds: ["rigachikun"],
    departureMinutes: 9 * 60, // 09:00
    durationMinutes: 2 * 60,
    platform: "A",
  },
  // Eastern Line: Port Harcourt → Enugu
  {
    id: "el-ph-en-01",
    lineName: "Eastern Line Express",
    trainNumber: "NRC 401",
    fromId: "ph-port-harcourt",
    toId: "enugu",
    intermediateStopIds: ["aba"],
    departureMinutes: 8 * 60, // 08:00
    durationMinutes: 6 * 60, // 6 hours
    platform: "1",
  },
  {
    id: "el-ph-en-02",
    lineName: "Eastern Line Passenger",
    trainNumber: "NRC 403",
    fromId: "ph-port-harcourt",
    toId: "enugu",
    intermediateStopIds: ["aba"],
    departureMinutes: 15 * 60, // 15:00
    durationMinutes: 7 * 60,
    platform: "2",
  },
  // Enugu → Port Harcourt
  {
    id: "el-en-ph-01",
    lineName: "Eastern Line Express",
    trainNumber: "NRC 402",
    fromId: "enugu",
    toId: "ph-port-harcourt",
    intermediateStopIds: ["aba"],
    departureMinutes: 7 * 60,
    durationMinutes: 6 * 60,
    platform: "1",
  },
  // Warri → Benin City → Lagos (Delta/Edo connector)
  {
    id: "wbl-01",
    lineName: "Warri–Lagos Line",
    trainNumber: "NRC 301",
    fromId: "warri",
    toId: "iddo",
    intermediateStopIds: ["sapele", "benin-city"],
    departureMinutes: 6 * 60,
    durationMinutes: 10 * 60,
    platform: "1",
  },
  // Lagos → Apapa
  {
    id: "ap-01",
    lineName: "Apapa Port Shuttle",
    trainNumber: "NRC 501",
    fromId: "iddo",
    toId: "apapa",
    intermediateStopIds: ["ebute-metta"],
    departureMinutes: 6 * 60,
    durationMinutes: 30,
    platform: "4",
  },
  {
    id: "ap-02",
    lineName: "Apapa Port Shuttle",
    trainNumber: "NRC 503",
    fromId: "iddo",
    toId: "apapa",
    intermediateStopIds: ["ebute-metta"],
    departureMinutes: 8 * 60,
    durationMinutes: 30,
    platform: "4",
  },
];

// Find routes matching from → to (direct or via stops)
export function findRoutes(fromId: string, toId: string, date: Date): TrainRoute[] {
  const matching = TIMETABLE.filter((entry) => {
    const allStops = [entry.fromId, ...entry.intermediateStopIds, entry.toId];
    const fromIdx = allStops.indexOf(fromId);
    const toIdx = allStops.indexOf(toId);
    return fromIdx !== -1 && toIdx !== -1 && toIdx > fromIdx;
  });

  const dateKey = Math.floor(date.getTime() / 86400000);

  return matching.map((entry): TrainRoute => {
    const allStopIds = [entry.fromId, ...entry.intermediateStopIds, entry.toId];
    const fromIdx = allStopIds.indexOf(fromId);
    const toIdx = allStopIds.indexOf(toId);
    const segmentStopIds = allStopIds.slice(fromIdx, toIdx + 1);

    // Total segment ratio for timing approximation
    const totalStops = allStopIds.length - 1;
    const fromRatio = fromIdx / totalStops;
    const toRatio = toIdx / totalStops;

    const segmentDuration = Math.round(entry.durationMinutes * (toRatio - fromRatio));
    const depOffset = Math.round(entry.departureMinutes + entry.durationMinutes * fromRatio);

    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    const departureTime = addMinutes(baseDate, depOffset);
    const arrivalTime = addMinutes(baseDate, depOffset + segmentDuration);

    // Build intermediate stops with approximate times
    const stops: Stop[] = segmentStopIds.map((sid, i) => {
      const ratio = (fromIdx + i) / totalStops - fromRatio;
      const approxOffset = depOffset + Math.round(entry.durationMinutes * ratio);
      const t = addMinutes(baseDate, approxOffset);
      const station = STATIONS.find((s) => s.id === sid);
      return {
        stationId: sid,
        stationName: station?.name ?? sid,
        arrivalTime: i === 0 ? null : t,
        departureTime: i === segmentStopIds.length - 1 ? null : t,
        platform: i === 0 ? entry.platform : null,
      };
    });

    const { status, delayMinutes, disruptions } = simulateStatus(dateKey + entry.id.charCodeAt(0));

    return {
      id: `${entry.id}-${dateKey}`,
      lineName: entry.lineName,
      trainNumber: entry.trainNumber,
      fromStation: stationById(fromId),
      toStation: stationById(toId),
      departureTime,
      arrivalTime,
      durationMinutes: segmentDuration,
      stops,
      status,
      delayMinutes,
      disruptions,
      platform: entry.platform,
      dataSource: "static-fallback",
    };
  });
}

export function sortByDuration(routes: TrainRoute[]): TrainRoute[] {
  return [...routes].sort((a, b) => a.durationMinutes - b.durationMinutes);
}
