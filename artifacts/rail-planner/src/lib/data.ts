// All static data — replaces the backend API entirely

export interface Station {
  id: string;
  name: string;
  city: string;
  state: string;
  code: string;
  description: string | null;
}

export const STATIONS: Station[] = [
  { id: "apapa", name: "Apapa Station", city: "Lagos", state: "Lagos", code: "APL", description: "Lagos terminus on the western line" },
  { id: "iddo", name: "Iddo Terminal", city: "Lagos", state: "Lagos", code: "IDO", description: "Main Lagos passenger terminal" },
  { id: "ebute-metta", name: "Ebute Metta Junction", city: "Lagos", state: "Lagos", code: "EBM", description: "Major Lagos junction" },
  { id: "agege", name: "Agege", city: "Agege", state: "Lagos", code: "AGG", description: null },
  { id: "iju", name: "Iju", city: "Lagos", state: "Lagos", code: "IJU", description: null },
  { id: "agbado", name: "Agbado", city: "Agbado", state: "Ogun", code: "ABD", description: null },
  { id: "abeokuta", name: "Abeokuta", city: "Abeokuta", state: "Ogun", code: "ABK", description: "Capital of Ogun State" },
  { id: "ibadan", name: "Ibadan", city: "Ibadan", state: "Oyo", code: "IBD", description: "Largest city in West Africa by area" },
  { id: "offa", name: "Offa", city: "Offa", state: "Kwara", code: "OFA", description: null },
  { id: "ilorin", name: "Ilorin", city: "Ilorin", state: "Kwara", code: "ILR", description: "Capital of Kwara State" },
  { id: "jebba", name: "Jebba", city: "Jebba", state: "Kwara", code: "JEB", description: "Niger River crossing" },
  { id: "minna", name: "Minna", city: "Minna", state: "Niger", code: "MNA", description: "Capital of Niger State" },
  { id: "kaduna", name: "Kaduna", city: "Kaduna", state: "Kaduna", code: "KDN", description: "Major northern commercial hub" },
  { id: "zaria", name: "Zaria", city: "Zaria", state: "Kaduna", code: "ZAR", description: null },
  { id: "kano", name: "Kano", city: "Kano", state: "Kano", code: "KNO", description: "Largest city in northern Nigeria" },
  { id: "idu", name: "Idu Station (Abuja)", city: "Abuja", state: "FCT", code: "IDU", description: "Abuja terminus of the Abuja–Kaduna line" },
  { id: "rigachikun", name: "Rigachikun", city: "Rigachikun", state: "Kaduna", code: "RGC", description: null },
  { id: "ph-port-harcourt", name: "Port Harcourt (Terminus)", city: "Port Harcourt", state: "Rivers", code: "PHC", description: "Southern Niger Delta terminus" },
  { id: "aba", name: "Aba", city: "Aba", state: "Abia", code: "ABA", description: "Commercial city in Abia State" },
  { id: "enugu", name: "Enugu", city: "Enugu", state: "Enugu", code: "ENU", description: "Coal City" },
  { id: "makurdi", name: "Makurdi", city: "Makurdi", state: "Benue", code: "MKD", description: "Capital of Benue State" },
  { id: "warri", name: "Warri", city: "Warri", state: "Delta", code: "WAR", description: "Major Delta State city" },
  { id: "sapele", name: "Sapele", city: "Sapele", state: "Delta", code: "SPL", description: null },
  { id: "benin-city", name: "Benin City", city: "Benin City", state: "Edo", code: "BNC", description: "Capital of Edo State" },
];

export type RouteStatus = "on-time" | "delayed" | "disrupted" | "cancelled";

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
  dataSource: "live" | "static-fallback";
}

export interface SearchResult {
  fastest: TrainRoute | null;
  alternatives: TrainRoute[];
  dataSource: string;
  searchedAt: string;
}

const TIMETABLE = [
  { id: "wl-lb-01", lineName: "Lagos–Ibadan Commuter", trainNumber: "NRC 101", fromId: "iddo", toId: "ibadan", stops: ["iddo","ebute-metta","agege","iju","agbado","abeokuta","ibadan"], depMins: 360, durMins: 270, platform: "3" },
  { id: "wl-lb-02", lineName: "Lagos–Ibadan Express", trainNumber: "NRC 103", fromId: "iddo", toId: "ibadan", stops: ["iddo","ebute-metta","abeokuta","ibadan"], depMins: 600, durMins: 210, platform: "1" },
  { id: "wl-bl-01", lineName: "Ibadan–Lagos Commuter", trainNumber: "NRC 102", fromId: "ibadan", toId: "iddo", stops: ["ibadan","abeokuta","agbado","iju","agege","ebute-metta","iddo"], depMins: 390, durMins: 270, platform: "2" },
  { id: "wl-bl-02", lineName: "Ibadan–Lagos Express", trainNumber: "NRC 104", fromId: "ibadan", toId: "iddo", stops: ["ibadan","abeokuta","ebute-metta","iddo"], depMins: 840, durMins: 210, platform: "1" },
  { id: "akg-01", lineName: "Abuja–Kaduna SGR", trainNumber: "NRC 201", fromId: "idu", toId: "kaduna", stops: ["idu","rigachikun","kaduna"], depMins: 420, durMins: 120, platform: "A" },
  { id: "akg-02", lineName: "Abuja–Kaduna SGR", trainNumber: "NRC 203", fromId: "idu", toId: "kaduna", stops: ["idu","rigachikun","kaduna"], depMins: 840, durMins: 120, platform: "B" },
  { id: "akg-03", lineName: "Kaduna–Abuja SGR", trainNumber: "NRC 202", fromId: "kaduna", toId: "idu", stops: ["kaduna","rigachikun","idu"], depMins: 540, durMins: 120, platform: "A" },
  { id: "wl-01", lineName: "Western Line Express", trainNumber: "NRC 001", fromId: "iddo", toId: "kano", stops: ["iddo","ebute-metta","agege","abeokuta","ibadan","ilorin","jebba","minna","kaduna","zaria","kano"], depMins: 420, durMins: 1140, platform: "1" },
  { id: "wl-kl-01", lineName: "Western Line Express", trainNumber: "NRC 002", fromId: "kano", toId: "iddo", stops: ["kano","zaria","kaduna","minna","jebba","ilorin","ibadan","abeokuta","ebute-metta","iddo"], depMins: 420, durMins: 1140, platform: "1" },
  { id: "wbl-01", lineName: "Warri–Lagos Line", trainNumber: "NRC 301", fromId: "warri", toId: "iddo", stops: ["warri","sapele","benin-city","iddo"], depMins: 360, durMins: 600, platform: "1" },
  { id: "el-ph-en-01", lineName: "Eastern Line Express", trainNumber: "NRC 401", fromId: "ph-port-harcourt", toId: "enugu", stops: ["ph-port-harcourt","aba","enugu"], depMins: 480, durMins: 360, platform: "1" },
  { id: "el-en-ph-01", lineName: "Eastern Line Express", trainNumber: "NRC 402", fromId: "enugu", toId: "ph-port-harcourt", stops: ["enugu","aba","ph-port-harcourt"], depMins: 420, durMins: 360, platform: "1" },
  { id: "ap-01", lineName: "Apapa Port Shuttle", trainNumber: "NRC 501", fromId: "iddo", toId: "apapa", stops: ["iddo","ebute-metta","apapa"], depMins: 360, durMins: 30, platform: "4" },
  { id: "ap-02", lineName: "Apapa Port Shuttle", trainNumber: "NRC 503", fromId: "iddo", toId: "apapa", stops: ["iddo","ebute-metta","apapa"], depMins: 480, durMins: 30, platform: "4" },
];

const DISRUPTIONS: { lineName: string; affectedIds: string[]; delayMins: number; msg: string }[] = [];

function stationById(id: string): Station {
  return STATIONS.find((s) => s.id === id)!;
}

function addMins(base: Date, mins: number): string {
  return new Date(base.getTime() + mins * 60000).toISOString();
}

function simulateStatus(seed: number): { status: RouteStatus; delayMinutes: number; disruptions: string | null } {
  const r = ((seed * 1103515245 + 12345) & 0x7fffffff) % 100;
  if (r < 65) return { status: "on-time", delayMinutes: 0, disruptions: null };
  if (r < 82) return { status: "delayed", delayMinutes: 15 + (r % 4) * 10, disruptions: `Delayed ~${15 + (r % 4) * 10} mins due to signal checks.` };
  if (r < 92) return { status: "delayed", delayMinutes: 45, disruptions: "Delayed 45 mins due to track maintenance." };
  return { status: "disrupted", delayMinutes: 0, disruptions: "Service disrupted. Engineering works in progress." };
}

export function searchRoutes(fromQuery: string, toQuery: string, date: Date): SearchResult {
  const q = (s: string) => s.toLowerCase().trim();
  const fromStation = STATIONS.find((s) => s.id === q(fromQuery) || s.name.toLowerCase().includes(q(fromQuery)) || s.city.toLowerCase().includes(q(fromQuery)) || s.code.toLowerCase() === q(fromQuery));
  const toStation = STATIONS.find((s) => s.id === q(toQuery) || s.name.toLowerCase().includes(q(toQuery)) || s.city.toLowerCase().includes(q(toQuery)) || s.code.toLowerCase() === q(toQuery));

  if (!fromStation || !toStation) return { fastest: null, alternatives: [], dataSource: "static-fallback", searchedAt: new Date().toISOString() };

  const dateKey = Math.floor(date.getTime() / 86400000);
  const base = new Date(date); base.setHours(0, 0, 0, 0);

  const routes: TrainRoute[] = TIMETABLE
    .filter((t) => {
      const fi = t.stops.indexOf(fromStation.id);
      const ti = t.stops.indexOf(toStation.id);
      return fi !== -1 && ti !== -1 && ti > fi;
    })
    .map((t): TrainRoute => {
      const fi = t.stops.indexOf(fromStation.id);
      const ti = t.stops.indexOf(toStation.id);
      const segStops = t.stops.slice(fi, ti + 1);
      const total = t.stops.length - 1;
      const fromRatio = fi / total;
      const toRatio = ti / total;
      const segDur = Math.round(t.durMins * (toRatio - fromRatio));
      const depOffset = Math.round(t.depMins + t.durMins * fromRatio);

      const disruption = DISRUPTIONS.find((d) => d.affectedIds.includes(t.id));
      const { status, delayMinutes, disruptions } = disruption
        ? { status: "delayed" as RouteStatus, delayMinutes: disruption.delayMins, disruptions: disruption.msg }
        : simulateStatus(dateKey + t.id.charCodeAt(0));

      const stops: Stop[] = segStops.map((sid, i) => {
        const ratio = (fi + i) / total - fromRatio;
        const t2 = addMins(base, depOffset + Math.round(t.durMins * ratio));
        return {
          stationId: sid,
          stationName: stationById(sid)?.name ?? sid,
          arrivalTime: i === 0 ? null : t2,
          departureTime: i === segStops.length - 1 ? null : t2,
          platform: i === 0 ? t.platform : null,
        };
      });

      return {
        id: `${t.id}-${dateKey}`,
        lineName: t.lineName,
        trainNumber: t.trainNumber,
        fromStation,
        toStation,
        departureTime: addMins(base, depOffset),
        arrivalTime: addMins(base, depOffset + segDur),
        durationMinutes: segDur,
        stops,
        status,
        delayMinutes,
        disruptions,
        platform: t.platform,
        dataSource: "static-fallback",
      };
    })
    .sort((a, b) => a.durationMinutes - b.durationMinutes);

  const [fastest = null, ...alternatives] = routes;
  return { fastest, alternatives, dataSource: "static-fallback", searchedAt: new Date().toISOString() };
}

export const SYSTEM_STATUS = {
  overallStatus: "operational" as const,
  dataSources: [
    { name: "NRC Live API", available: false, lastChecked: new Date().toISOString(), latencyMs: null },
    { name: "Static Timetable (Fallback)", available: true, lastChecked: new Date().toISOString(), latencyMs: 0 },
  ],
  activeDisruptions: [] as { id: string; lineName: string; description: string; severity: "low" | "medium" | "high"; affectedStations: string[] }[],
};
