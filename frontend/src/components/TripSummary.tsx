import type { TripResponse } from "../services/api";

interface Props {
  trip: TripResponse;
}

function formatDuration(hours: number) {
  const totalMinutes = Math.round(hours * 60);
  const days = Math.floor(totalMinutes / 1440);
  const remaining = totalMinutes % 1440;
  const hrs = Math.floor(remaining / 60);
  const mins = remaining % 60;

  const parts = [];

  if (days) parts.push(`${days}d`);
  if (hrs) parts.push(`${hrs}h`);
  if (mins) parts.push(`${mins}m`);

  return parts.join(" ") || "0m";
}

export default function TripSummary({ trip }: Props) {
  const totalElapsedHours = trip.hos.events.reduce(
    (sum, event) => sum + event.duration,
    0
  );

  const breakCount = trip.hos.events.filter(
    (event) => event.label === "30-minute rest break"
  ).length;

  const restCount = trip.hos.events.filter(
    (event) =>
      event.label === "10-hour required rest" ||
      event.label === "34-hour cycle restart"
  ).length;

  const fuelCount = trip.hos.events.filter(
    (event) => event.label === "Fuel stop"
  ).length;

  return (
    <section className="trip-summary">
      <div className="summary-heading">
        <span className="eyebrow">TRIP OVERVIEW</span>
        <h2>Trip Summary</h2>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Distance</span>
          <strong>{trip.route.distance_miles} mi</strong>
        </div>

        <div className="summary-card">
          <span>Driving Time</span>
          <strong>
            {formatDuration(trip.route.duration_hours)}
          </strong>
        </div>

        <div className="summary-card">
          <span>Elapsed Trip Time</span>
          <strong>
            {formatDuration(totalElapsedHours)}
          </strong>
        </div>

        <div className="summary-card">
          <span>Daily Logs</span>
          <strong>{trip.daily_logs.length}</strong>
        </div>
      </div>

      <div className="stop-summary">
        <div>
          <strong>{breakCount}</strong>
          <span>30-min breaks</span>
        </div>

        <div>
          <strong>{restCount}</strong>
          <span>rest / restart periods</span>
        </div>

        <div>
          <strong>{fuelCount}</strong>
          <span>fuel stops</span>
        </div>

        <div>
          <strong>{trip.hos.cycle_remaining}</strong>
          <span>cycle hrs remaining</span>
        </div>
      </div>
    </section>
  );
}