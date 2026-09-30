import type { TripResponse } from "../services/api";

interface Props {
  trip: TripResponse;
}

function formatDuration(hours: number) {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export default function HOSTimeline({ trip }: Props) {
  return (
    <section className="hos-section">
      <div className="hos-heading">
        <div>
          <span className="eyebrow">HOS COMPLIANT PLAN</span>
          <h2>Driver Schedule</h2>
        </div>

        <div className="cycle-summary">
          <strong>{trip.hos.cycle_remaining} hrs</strong>
          <span>cycle remaining</span>
        </div>
      </div>

      <div className="timeline">
        {trip.hos.events.map((event, index) => (
          <div className="timeline-event" key={index}>
            <div className={`status-dot ${event.status}`} />

            <div className="event-content">
              <div className="event-header">
                <strong>{event.label}</strong>
                <span>{formatDuration(event.duration)}</span>
              </div>

              <div className="event-meta">
                <span>
                  {event.status
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>

                {event.location && (
                  <span> • {event.location}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hos-summary">
        <div>
          <span>Cycle Used</span>
          <strong>{trip.hos.cycle_used} hrs</strong>
        </div>

        <div>
          <span>Cycle Remaining</span>
          <strong>{trip.hos.cycle_remaining} hrs</strong>
        </div>

        <div>
          <span>Driving Distance</span>
          <strong>{trip.route.distance_miles} mi</strong>
        </div>
      </div>

      <div className="planning-note">
      <strong>Planning assumptions</strong>
      <p>
        Property-carrying driver using the 70-hour / 8-day cycle.
        The supplied cycle-used value is treated as the driver's
        current cumulative on-duty total. If insufficient cycle
        hours remain, the planner schedules a 34-hour restart before
        additional driving.
      </p>
    </div>
    </section>
  );
}