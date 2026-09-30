import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .services.routing import calculate_route, search_locations
from .services.hos_engine import HOSEngine
from .services.eld_generator import generate_daily_logs
from .services.route_stops import generate_route_stops

@api_view(["GET"])
def location_search(request):
    query = request.query_params.get("q", "").strip()

    if len(query) < 2:
        return Response([])

    try:
        locations = search_locations(query)
        return Response(locations)

    except requests.RequestException:
        return Response(
            {"error": "Location search service is temporarily unavailable."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

@api_view(["POST"])
def calculate_trip(request):

    current_location = request.data.get("current_location")
    pickup_location = request.data.get("pickup_location")
    dropoff_location = request.data.get("dropoff_location")
    current_cycle_used = request.data.get("current_cycle_used")

    if not all([
        current_location,
        pickup_location,
        dropoff_location,
        current_cycle_used is not None,
    ]):
        return Response(
            {"error": "All trip fields are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        current_cycle_used = float(current_cycle_used)
    except (TypeError, ValueError):
        return Response(
            {"error": "Current cycle used must be a number."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not 0 <= current_cycle_used <= 70:
        return Response(
            {"error": "Current cycle used must be between 0 and 70 hours."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        route_data = calculate_route(
            current_location,
            pickup_location,
            dropoff_location,
        )

        route = route_data["route"]

        hos_engine = HOSEngine(current_cycle_used)

        hos_schedule = hos_engine.generate_trip(
            first_leg_hours=route["leg_durations"][0],
            second_leg_hours=route["leg_durations"][1],

            first_leg_distance=route["leg_distances"][0],
            second_leg_distance=route["leg_distances"][1],

            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
        )

        route_stops = generate_route_stops(
            events=hos_schedule["events"],
            route_geometry=route["geometry"],
            total_distance=route["distance_miles"],
            total_driving_hours=route["duration_hours"],
        )

        daily_logs = generate_daily_logs(
            hos_schedule["events"]
        )

    except ValueError as exc:
        return Response(
            {"error": str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception:
        return Response(
            {"error": "Routing service is currently unavailable."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response({
        "current_location": current_location,
        "pickup_location": pickup_location,
        "dropoff_location": dropoff_location,
        "current_cycle_used": current_cycle_used,

        **route_data,

        "hos": hos_schedule,
        "daily_logs": daily_logs,
        "route_stops": route_stops,
    })