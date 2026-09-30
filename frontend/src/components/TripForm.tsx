import { useState } from "react";
import axios from "axios";
import { calculateTrip, type TripResponse } from "../services/api";
import RouteMap from "./RouteMap";
import HOSTimeline from "./HOSTimeline";
import ELDLogs from "./ELDLogs";
import TripSummary from "./TripSummary";

export default function TripForm() {
  const [currentLocation, setCurrentLocation] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [cycleUsed, setCycleUsed] = useState(0);

  const [result, setResult] = useState<TripResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !currentLocation.trim() ||
      !pickupLocation.trim() ||
      !dropoffLocation.trim()
    ) {
      setError("Please enter all three locations.");
      return;
    }

    if (
      !Number.isFinite(cycleUsed) ||
      cycleUsed < 0 ||
      cycleUsed > 70
    ) {
      setError(
        "Current cycle used must be between 0 and 70 hours."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await calculateTrip({
        current_location: currentLocation.trim(),
        pickup_location: pickupLocation.trim(),
        dropoff_location: dropoffLocation.trim(),
        current_cycle_used: cycleUsed,
      });

      setResult(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
          "Unable to calculate the trip. Please try again."
        );
      } else {
        setError(
          "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="trip-card">
      <div className="card-header">
        <span className="eyebrow">FMCSA HOS Planner</span>
        <h2>Plan Your Trip</h2>
        <p>
          Enter your route and current cycle usage to generate a
          compliant trip plan and ELD logs.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Current Location
          <input
            type="text"
            placeholder="e.g. Chicago, IL"
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
            required
          />
        </label>

        <label>
          Pickup Location
          <input
            type="text"
            placeholder="e.g. Indianapolis, IN"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
          />
        </label>

        <label>
          Drop-off Location
          <input
            type="text"
            placeholder="e.g. Atlanta, GA"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            required
          />
        </label>

        <label>
          Current Cycle Used
          <div className="hours-input">
            <input
              type="number"
              min="0"
              max="70"
              step="0.5"
              value={cycleUsed}
              onChange={(e) => setCycleUsed(Number(e.target.value))}
              required
            />
            <span>hours</span>
          </div>
        </label>

        <div className="cycle-info">
          <span>70-hour / 8-day cycle</span>
          <strong>{Math.max(0, 70 - cycleUsed)} hrs remaining</strong>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Plan Trip"}
        </button>
        {loading && (
          <div className="loading-message">
            Calculating route and Hours of Service schedule…
          </div>
        )}
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <>
          <div className="result">
            <h3>Trip initialized successfully</h3>

            <div className="result-grid">
              <div>
                <span>Current</span>
                <strong>{result.current_location}</strong>
              </div>

              <div>
                <span>Pickup</span>
                <strong>{result.pickup_location}</strong>
              </div>

              <div>
                <span>Drop-off</span>
                <strong>{result.dropoff_location}</strong>
              </div>

              <div>
                <span>Cycle Remaining</span>
                <strong>{result.cycle_remaining} hrs</strong>
              </div>
            </div>
          </div>

          <TripSummary trip={result} />

          <RouteMap trip={result} />

          <HOSTimeline trip={result} />

          <ELDLogs trip={result} />
        </>
      )}
    </div>
  );
}