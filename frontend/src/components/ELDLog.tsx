import type {
  DailyLog,
  DailyLogEvent,
} from "../services/api";

interface Props {
  log: DailyLog;
}

const ROWS = [
  {
    key: "off_duty",
    label: "1. Off Duty",
  },
  {
    key: "sleeper",
    label: "2. Sleeper Berth",
  },
  {
    key: "driving",
    label: "3. Driving",
  },
  {
    key: "on_duty",
    label: "4. On Duty",
  },
] as const;

const ROW_Y: Record<string, number> = {
  off_duty: 25,
  sleeper: 75,
  driving: 125,
  on_duty: 175,
};

const LEFT = 125;
const WIDTH = 960;
const HEIGHT = 200;

function xForHour(hour: number) {
  return LEFT + (hour / 24) * WIDTH;
}

function buildDutyPath(events: DailyLogEvent[]) {
  if (!events.length) return "";

  let path = "";

  events.forEach((event, index) => {
    const startX = xForHour(event.start);
    const endX = xForHour(event.end);
    const y = ROW_Y[event.status];

    if (index === 0) {
      path += `M ${startX} ${y}`;
    } else {
      const previous = events[index - 1];
      const previousY = ROW_Y[previous.status];

      path += ` L ${startX} ${previousY}`;
      path += ` L ${startX} ${y}`;
    }

    path += ` L ${endX} ${y}`;
  });

  return path;
}

function formatHours(hours: number) {
  if (Number.isInteger(hours)) {
    return `${hours.toFixed(0)}h`;
  }

  return `${hours.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}h`;
}

export default function ELDLog({ log }: Props) {
  const dutyPath = buildDutyPath(log.events);

  return (
    <article className="eld-sheet">
      <div className="eld-title">
        <div>
          <span className="eyebrow">DRIVER'S DAILY LOG</span>
          <h3>Day {log.day}</h3>
        </div>

        <span className="eld-total">
          Total: {log.total_hours} hrs
        </span>
      </div>

      <div className="eld-scroll">
        <svg
          className="eld-grid"
          viewBox={`0 0 ${LEFT + WIDTH + 70} ${HEIGHT + 55}`}
          role="img"
          aria-label={`Driver daily log for day ${log.day}`}
        >
          <text
            x={LEFT + WIDTH + 15}
            y="13"
            className="eld-total-heading"
          >
            Hours
          </text>
          {/* Horizontal duty-status lines */}
          {ROWS.map((row) => {
            const y = ROW_Y[row.key];

            return (
              <g key={row.key}>
                <text
                  x="0"
                  y={y + 5}
                  className="eld-row-label"
                >
                  {row.label}
                </text>

                <line
                  x1={LEFT}
                  y1={y}
                  x2={LEFT + WIDTH}
                  y2={y}
                  className="eld-horizontal"
                />
              </g>
            );
          })}

          {/* Hour lines and labels */}
          {Array.from({ length: 25 }, (_, hour) => {
            const x = xForHour(hour);

            return (
              <g key={hour}>
                <line
                  x1={x}
                  y1="5"
                  x2={x}
                  y2={HEIGHT}
                  className={
                    hour % 6 === 0
                      ? "eld-hour eld-hour-major"
                      : "eld-hour"
                  }
                />

                {hour < 24 && (
                  <text
                    x={x + 2}
                    y="13"
                    className="eld-hour-label"
                  >
                    {hour === 0
                      ? "Midnight"
                      : hour === 12
                        ? "Noon"
                        : hour % 2 === 0
                          ? hour > 12
                            ? hour - 12
                            : hour
                          : ""}
                  </text>
                )}
              </g>
            );
          })}

          {/* Quarter-hour ticks */}
          {Array.from({ length: 96 }, (_, index) => {
            const quarter = index / 4;

            if (index % 4 === 0) {
              return null;
            }

            const x = xForHour(quarter);

            return (
              <line
                key={index}
                x1={x}
                y1="15"
                x2={x}
                y2={HEIGHT}
                className="eld-quarter"
              />
            );
          })}

          {/* Actual duty-status trace */}
          <path
            d={dutyPath}
            className="eld-duty-path"
          />

          {/* Totals */}
          {ROWS.map((row) => (
            <text
              key={`total-${row.key}`}
              x={LEFT + WIDTH + 15}
              y={ROW_Y[row.key] + 5}
              className="eld-row-total"
            >
              {formatHours(log.totals[row.key])}
            </text>
          ))}
        </svg>
      </div>

      <div className="eld-remarks">
        <strong>Remarks</strong>

        {log.events
          .filter(
            (event) =>
              event.label !== "Driving" &&
              event.label !== "Off Duty"
          )
          .map((event, index) => (
            <div key={index}>
              <span>
                {formatClock(event.start)}
              </span>

              <strong>{event.label}</strong>

              {event.location && (
                <span> — {event.location}</span>
              )}
            </div>
          ))}
      </div>
    </article>
  );
}

function formatClock(decimalHour: number) {
  let hours = Math.floor(decimalHour);
  let minutes = Math.round(
    (decimalHour - hours) * 60
  );

  if (minutes === 60) {
    hours += 1;
    minutes = 0;
  }

  hours %= 24;

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
}