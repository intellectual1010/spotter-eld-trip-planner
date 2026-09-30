import axios from "axios";

export interface TripRequest {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: number;
}

export interface Location {
  name: string;
  lat: number;
  lon: number;
}

export interface TripResponse extends TripRequest {
  cycle_remaining: number;

  locations: {
    current: Location;
    pickup: Location;
    dropoff: Location;
  };

  route: {
    distance_miles: number;
    duration_hours: number;

    geometry: {
      type: "LineString";
      coordinates: number[][];
    };
  };

  hos: {
    events: HOSEvent[];
    cycle_used: number;
    cycle_remaining: number;
  };

  daily_logs: DailyLog[];

  route_stops: RouteStop[];
}

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api",
});

export async function calculateTrip(
  data: TripRequest
): Promise<TripResponse> {
  const response = await api.post<TripResponse>(
    "/trips/calculate/",
    data
  );

  return response.data;
}

export interface HOSEvent {
  status: "driving" | "on_duty" | "off_duty" | "sleeper";
  duration: number;
  label: string;
  location: string;
}

export interface DailyLogEvent {
  status: "off_duty" | "sleeper" | "driving" | "on_duty";
  label: string;
  location: string;
  start: number;
  end: number;
  duration: number;
}

export interface DailyLog {
  day: number;
  events: DailyLogEvent[];
  totals: {
    off_duty: number;
    sleeper: number;
    driving: number;
    on_duty: number;
  };
  total_hours: number;
}

export interface RouteStop {
  type: "break" | "rest" | "fuel";
  label: string;
  duration: number;
  distance_miles: number;
  lat: number;
  lon: number;
}