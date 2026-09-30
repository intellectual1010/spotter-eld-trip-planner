from typing import List, Dict


def generate_daily_logs(events: List[Dict]):
    """
    Converts sequential HOS events into 24-hour ELD log days.

    The calculated trip begins at 00:00 on Day 1.
    """

    days = []
    current_day = 1
    current_time = 0.0
    day_events = []

    for event in events:
        remaining = float(event["duration"])

        while remaining > 0.0001:
            space_in_day = 24.0 - current_time
            chunk = min(remaining, space_in_day)

            day_events.append({
                "status": event["status"],
                "label": event["label"],
                "location": event.get("location", ""),
                "start": round(current_time, 4),
                "end": round(current_time + chunk, 4),
                "duration": round(chunk, 4),
            })

            current_time += chunk
            remaining -= chunk

            if current_time >= 23.9999:
                days.append(
                    build_day(current_day, day_events)
                )

                current_day += 1
                current_time = 0.0
                day_events = []

    if day_events:
        # Fill the unused portion of the final day as off duty.
        if current_time < 24.0:
            day_events.append({
                "status": "off_duty",
                "label": "Off Duty",
                "location": "",
                "start": round(current_time, 4),
                "end": 24.0,
                "duration": round(24.0 - current_time, 4),
            })

        days.append(
            build_day(current_day, day_events)
        )

    return days


def build_day(day_number: int, events: List[Dict]):
    totals = {
        "off_duty": 0.0,
        "sleeper": 0.0,
        "driving": 0.0,
        "on_duty": 0.0,
    }

    for event in events:
        status = event["status"]

        if status in totals:
            totals[status] += event["duration"]

    totals = {
        key: round(value, 2)
        for key, value in totals.items()
    }

    return {
        "day": day_number,
        "events": events,
        "totals": totals,
        "total_hours": round(sum(totals.values()), 2),
    }