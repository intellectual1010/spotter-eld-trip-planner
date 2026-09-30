import requests


NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OSRM_URL = "https://router.project-osrm.org/route/v1/driving"

HEADERS = {
    "User-Agent": "spotter-eld-assessment/1.0"
}


def geocode_location(location):
    response = requests.get(
        NOMINATIM_URL,
        params={
            "q": location,
            "format": "json",
            "limit": 1,
            "countrycodes": "us",
        },
        headers=HEADERS,
        timeout=10,
    )

    response.raise_for_status()

    results = response.json()

    if not results:
        raise ValueError(
            f'Location "{location}" could not be found. '
            "Please enter a valid U.S. city, state, or address."
        )

    result = results[0]

    return {
        "name": result["display_name"],
        "lat": float(result["lat"]),
        "lon": float(result["lon"]),
    }

def search_locations(query, limit=6):
    query = query.strip()

    if len(query) < 2:
        return []

    response = requests.get(
        NOMINATIM_URL,
        params={
            "q": query,
            "format": "json",
            "limit": limit,
            "countrycodes": "us",
            "addressdetails": 1,
        },
        headers=HEADERS,
        timeout=10,
    )

    response.raise_for_status()

    results = response.json()

    suggestions = []

    for result in results:
        address = result.get("address", {})

        city = (
            address.get("city")
            or address.get("town")
            or address.get("village")
            or address.get("municipality")
            or address.get("county")
        )

        state = address.get("state")
        state_code = address.get("ISO3166-2-lvl4", "")
        postcode = address.get("postcode")

        if state_code.startswith("US-"):
            state_display = state_code.replace("US-", "")
        else:
            state_display = state

        parts = [part for part in [city, state_display] if part]

        if postcode:
            parts.append(postcode)

        label = ", ".join(parts)

        if not label:
            label = result["display_name"]

        suggestions.append({
            "label": label,
            "display_name": result["display_name"],
            "lat": float(result["lat"]),
            "lon": float(result["lon"]),
        })

    # Remove duplicate labels while preserving order.
    unique = []
    seen = set()

    for suggestion in suggestions:
        key = suggestion["label"].lower()

        if key not in seen:
            seen.add(key)
            unique.append(suggestion)

    return unique

def get_route(locations):
    coordinates = ";".join(
        f"{location['lon']},{location['lat']}"
        for location in locations
    )

    url = f"{OSRM_URL}/{coordinates}"

    response = requests.get(
        url,
        params={
            "overview": "full",
            "geometries": "geojson",
            "steps": "true",
        },
        timeout=15,
    )

    response.raise_for_status()

    data = response.json()

    if data.get("code") != "Ok" or not data.get("routes"):
        raise ValueError("Unable to calculate route.")

    route = data["routes"][0]

    legs = route.get("legs", [])

    return {
    "distance_miles": round(
        route["distance"] / 1609.344, 1
    ),
    "duration_hours": round(
        route["duration"] / 3600, 2
    ),
    "leg_durations": [
        round(leg["duration"] / 3600, 2)
        for leg in legs
    ],
    "leg_distances": [
        round(leg["distance"] / 1609.344, 1)
        for leg in legs
    ],
    "geometry": route["geometry"],
}


def calculate_route(current, pickup, dropoff):
    current_location = geocode_location(current)
    pickup_location = geocode_location(pickup)
    dropoff_location = geocode_location(dropoff)

    route = get_route([
        current_location,
        pickup_location,
        dropoff_location,
    ])

    return {
        "locations": {
            "current": current_location,
            "pickup": pickup_location,
            "dropoff": dropoff_location,
        },
        "route": route,
    }