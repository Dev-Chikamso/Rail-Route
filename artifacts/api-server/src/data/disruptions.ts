export interface Disruption {
  id: string;
  lineName: string;
  description: string;
  severity: "low" | "medium" | "high";
  affectedStations: string[];
}

// Static disruptions — in a real app these would come from live APIs
export const ACTIVE_DISRUPTIONS: Disruption[] = [
  {
    id: "d-001",
    lineName: "Western Line Express",
    description: "Engineering works between Minna and Kaduna. Expect 30-minute delays on all northbound services.",
    severity: "medium",
    affectedStations: ["Minna", "Kaduna", "Zaria"],
  },
  {
    id: "d-002",
    lineName: "Abuja–Kaduna SGR",
    description: "All services operating normally.",
    severity: "low",
    affectedStations: [],
  },
];
