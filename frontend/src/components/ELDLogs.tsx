import { useState } from "react";
import type { TripResponse } from "../services/api";
import ELDLog from "./ELDLog";

interface Props {
  trip: TripResponse;
}

export default function ELDLogs({ trip }: Props) {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <section className="eld-section">
      <div className="eld-section-heading">
        <span className="eyebrow">
          RECORD OF DUTY STATUS
        </span>

        <h2>Driver's Daily Logs</h2>

        <p>
          Generated from the calculated Hours of Service schedule.
        </p>
      </div>

      <div className="day-tabs">
        {trip.daily_logs.map((log, index) => (
          <button
            type="button"
            key={log.day}
            className={
              activeDay === index
                ? "day-tab active"
                : "day-tab"
            }
            onClick={() => setActiveDay(index)}
          >
            Day {log.day}
          </button>
        ))}
      </div>

      <ELDLog log={trip.daily_logs[activeDay]} />
    </section>
  );
}