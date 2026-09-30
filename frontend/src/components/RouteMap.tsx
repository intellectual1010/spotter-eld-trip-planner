import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";

import { useEffect } from "react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

import type { TripResponse } from "../services/api";

interface Props {
  trip: TripResponse;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FitRoute({
  positions,
}: {
  positions: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, {
        padding: [40, 40],
      });
    }
  }, [map, positions]);

  return null;
}

export default function RouteMap({ trip }: Props) {
  const routePositions: [number, number][] =
    trip.route.geometry.coordinates.map(
      ([lon, lat]) => [lat, lon]
    );

  const current: [number, number] = [
    trip.locations.current.lat,
    trip.locations.current.lon,
  ];

  const pickup: [number, number] = [
    trip.locations.pickup.lat,
    trip.locations.pickup.lon,
  ];

  const dropoff: [number, number] = [
    trip.locations.dropoff.lat,
    trip.locations.dropoff.lon,
  ];

  return (
    <section className="route-section">
      <div className="route-heading">
        <div>
          <span className="eyebrow">Calculated Route</span>
          <h2>Trip Route</h2>
        </div>

        <div className="route-stats">
          <div>
            <strong>{trip.route.distance_miles}</strong>
            <span>miles</span>
          </div>

          <div>
            <strong>{trip.route.duration_hours}</strong>
            <span>driving hrs</span>
          </div>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={current}
          zoom={6}
          scrollWheelZoom
          className="route-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Polyline
            positions={routePositions}
            pathOptions={{
              weight: 5,
              opacity: 0.85,
            }}
          />

          <Marker position={current}>
            <Popup>
              <strong>Start</strong>
              <br />
              {trip.current_location}
            </Popup>
          </Marker>

          <Marker position={pickup}>
            <Popup>
              <strong>Pickup</strong>
              <br />
              {trip.pickup_location}
            </Popup>
          </Marker>

          <Marker position={dropoff}>
            <Popup>
              <strong>Drop-off</strong>
              <br />
              {trip.dropoff_location}
            </Popup>
          </Marker>

          {trip.route_stops.map((stop, index) => (
            <CircleMarker
              key={`${stop.type}-${index}`}
              center={[stop.lat, stop.lon]}
              radius={8}
              pathOptions={{
                color:
                  stop.type === "fuel"
                    ? "#b45309"
                    : stop.type === "rest"
                      ? "#475569"
                      : "#7c3aed",

                fillColor:
                  stop.type === "fuel"
                    ? "#f59e0b"
                    : stop.type === "rest"
                      ? "#64748b"
                      : "#8b5cf6",

                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Popup>
                <div className="stop-popup">
                  <strong>{stop.label}</strong>

                  <div>
                    {formatStopDuration(stop.duration)}
                  </div>

                  <div>
                    Approx. {stop.distance_miles} miles into trip
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          <FitRoute positions={routePositions} />
        </MapContainer>

        <div className="map-legend">
          <div>
            <span className="legend-dot break-dot" />
            30-min Break
          </div>

          <div>
            <span className="legend-dot rest-dot" />
            10-hour Rest
          </div>

          <div>
            <span className="legend-dot fuel-dot" />
            Fuel Stop
          </div>
        </div>
      </div>
    </section>
  );
}

function formatStopDuration(hours: number) {
  const minutes = Math.round(hours * 60);

  if (minutes < 60) {
    return `${minutes} minutes`;
  }

  const wholeHours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!remainingMinutes) {
    return `${wholeHours} hours`;
  }

  return `${wholeHours}h ${remainingMinutes}m`;
}