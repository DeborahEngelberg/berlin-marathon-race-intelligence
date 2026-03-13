export interface Bullet {
  id: string;
  text: string;
  sourceName: string;
  sourceUrl: string;
  label: string;
  audience: 'Runner' | 'Spectator' | 'Both';
  confidence: 'High' | 'Med' | 'Low';
  recurrenceCount?: number;
  languageOrigin: 'DE' | 'EN' | 'MIX';
  tags: string[];
  timeMinutes?: number | null;
  timeText?: string | null;
  section: string;
  subsection: string;
}

export interface Crossing {
  id: string;
  name: string;
  locationText: string;
  nearestStations: string[];
  type: 'underpass' | 'bridge' | 'station-tunnel' | 'designated-crossing' | 'road-tunnel';
  canCrossText: string;
  sideOutcomeText: string;
  trapRiskText: string;
  sourceName: string;
  sourceUrl: string;
  confidence: 'High' | 'Med' | 'Low';
  notes: string;
  lat?: number;
  lng?: number;
}

export interface RouteSpot {
  name: string;
  lat?: number;
  lng?: number;
  station: string;
  lines: string[];
  exitGuidance: string;
  sideGuidance: string;
  kmMarker?: number;
}

export interface Route {
  id: string;
  name: string;
  paceBand: string;
  spots: RouteSpot[];
  feasibility: 'High' | 'Medium' | 'Low';
  failureModes: string[];
  backupPlan: string;
  citations: Citation[];
}

export interface Citation {
  sourceName: string;
  sourceUrl: string;
}

export interface FailureMode {
  id: string;
  title: string;
  audience: 'Runner' | 'Spectator' | 'Both';
  whyFails: string;
  veteranFix: string;
  alternatePlan: string;
  citations: Citation[];
}

export interface LodgingOption {
  id: string;
  anchor: string;
  station?: string;
  frictionScore: 'Low' | 'Med' | 'High';
  finishScore: 'Low' | 'Med' | 'High';
  mobilityScore: 'Low' | 'Med' | 'High';
  quietRisk: string;
  avoidWarning: string;
  citations: Citation[];
}

export interface Restaurant {
  id: string;
  name: string;
  neighborhood: string;
  station: string;
  purposeTags: string[];
  orderNotes: string;
  reservationHack: string;
  hoursProofText: string;
  citations: Citation[];
  confidence: 'High' | 'Med' | 'Low';
}

export interface SavedItem {
  id: string;
  type: 'bullet' | 'route' | 'crossing' | 'restaurant' | 'lodging' | 'failure';
  title: string;
  timestamp: number;
}

export interface FilterState {
  audience: string[];
  label: string[];
  confidence: string[];
  recurrenceOnly: boolean;
  languageOrigin: string[];
}
