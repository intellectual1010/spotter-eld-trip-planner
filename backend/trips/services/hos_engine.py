from dataclasses import dataclass, asdict
from typing import List


@dataclass
class DutyEvent:
    status: str
    duration: float
    label: str
    location: str = ""


class HOSEngine:
    MAX_DRIVING = 11.0
    DRIVING_WINDOW = 14.0
    BREAK_AFTER_DRIVING = 8.0
    BREAK_DURATION = 0.5
    DAILY_REST = 10.0
    CYCLE_LIMIT = 70.0

    PICKUP_DURATION = 1.0
    DROPOFF_DURATION = 1.0
    FUEL_DURATION = 0.5
    FUEL_INTERVAL_MILES = 1000.0

    def __init__(self, current_cycle_used: float):
        self.cycle_used = current_cycle_used
        self.events: List[DutyEvent] = []

        self.driving_since_break = 0.0
        self.driving_today = 0.0
        self.on_duty_window = 0.0

    def add_event(
        self,
        status: str,
        duration: float,
        label: str,
        location: str = "",
    ):
        self.events.append(
            DutyEvent(
                status=status,
                duration=round(duration, 2),
                label=label,
                location=location,
            )
        )

        # Driving and on-duty time count toward the 70-hour cycle.
        if status in ("driving", "on_duty"):
            self.cycle_used += duration

        # Once the duty window starts, elapsed time continues running.
        # A 30-minute break does not pause the 14-hour window.
        self.on_duty_window += duration

        if status == "driving":
            self.driving_today += duration
            self.driving_since_break += duration

    def add_break(self):
        self.add_event(
            "off_duty",
            self.BREAK_DURATION,
            "30-minute rest break",
        )

        self.driving_since_break = 0.0

    def add_daily_rest(self):
        self.events.append(
            DutyEvent(
                status="off_duty",
                duration=self.DAILY_REST,
                label="10-hour required rest",
            )
        )

        self.driving_today = 0.0
        self.driving_since_break = 0.0
        self.on_duty_window = 0.0

    def ensure_cycle_available(self):
        if self.cycle_used >= self.CYCLE_LIMIT:
            self.events.append(
                DutyEvent(
                    status="off_duty",
                    duration=34.0,
                    label="34-hour cycle restart",
                )
            )

            self.cycle_used = 0.0
            self.driving_today = 0.0
            self.driving_since_break = 0.0
            self.on_duty_window = 0.0

    def add_on_duty_stop(
        self,
        duration: float,
        label: str,
        location: str,
    ):
        self.ensure_cycle_available()

        self.add_event(
            "on_duty",
            duration,
            label,
            location,
        )

    def drive(self, hours: float):
        remaining = hours

        while remaining > 0.001:
            self.ensure_cycle_available()

            if (
                self.driving_today >= self.MAX_DRIVING
                or self.on_duty_window >= self.DRIVING_WINDOW
            ):
                self.add_daily_rest()
                continue

            if self.driving_since_break >= self.BREAK_AFTER_DRIVING:
                self.add_break()
                continue

            drive_capacity = min(
                self.MAX_DRIVING - self.driving_today,
                self.DRIVING_WINDOW - self.on_duty_window,
                self.BREAK_AFTER_DRIVING - self.driving_since_break,
                self.CYCLE_LIMIT - self.cycle_used,
                remaining,
            )

            if drive_capacity <= 0:
                self.add_daily_rest()
                continue

            self.add_event(
                "driving",
                drive_capacity,
                "Driving",
            )

            remaining -= drive_capacity

    def generate_trip(
        self,
        first_leg_hours: float,
        second_leg_hours: float,
        first_leg_distance: float,
        second_leg_distance: float,
        pickup_location: str,
        dropoff_location: str,
    ):
        miles_since_fuel = 0.0

        # Current location -> pickup
        miles_since_fuel = self.drive_with_fuel(
            hours=first_leg_hours,
            distance=first_leg_distance,
            miles_since_fuel=miles_since_fuel,
        )

        self.add_on_duty_stop(
            self.PICKUP_DURATION,
            "Pickup",
            pickup_location,
        )

        # Pickup -> drop-off
        self.drive_with_fuel(
            hours=second_leg_hours,
            distance=second_leg_distance,
            miles_since_fuel=miles_since_fuel,
        )

        self.add_on_duty_stop(
            self.DROPOFF_DURATION,
            "Drop-off",
            dropoff_location,
        )

        return {
            "events": [
                asdict(event)
                for event in self.events
            ],
            "cycle_used": round(self.cycle_used, 2),
            "cycle_remaining": round(
                max(0, self.CYCLE_LIMIT - self.cycle_used),
                2,
            ),
        }
    
    def drive_with_fuel(
        self,
        hours: float,
        distance: float,
        miles_since_fuel: float,
    ):
        if distance <= 0 or hours <= 0:
            return miles_since_fuel

        remaining_hours = hours
        remaining_distance = distance

        while remaining_distance > 0.01:
            miles_until_fuel = (
                self.FUEL_INTERVAL_MILES - miles_since_fuel
            )

            chunk_distance = min(
                remaining_distance,
                miles_until_fuel,
            )

            chunk_hours = (
                remaining_hours
                * chunk_distance
                / remaining_distance
            )

            self.drive(chunk_hours)

            remaining_hours -= chunk_hours
            remaining_distance -= chunk_distance
            miles_since_fuel += chunk_distance

            if (
                miles_since_fuel >= self.FUEL_INTERVAL_MILES - 0.01
                and remaining_distance > 0.01
            ):
                self.add_on_duty_stop(
                    self.FUEL_DURATION,
                    "Fuel stop",
                    "Along route",
                )

                miles_since_fuel = 0.0

        return miles_since_fuel