from math import radians, sin, cos, sqrt, atan2


def haversine_miles(a, b):
    lon1, lat1 = a
    lon2, lat2 = b

    r = 3958.8

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    lat1 = radians(lat1)
    lat2 = radians(lat2)

    value = (
        sin(dlat / 2) ** 2
        + cos(lat1)
        * cos(lat2)
        * sin(dlon / 2) ** 2
    )

    return 2 * r * atan2(
        sqrt(value),
        sqrt(1 - value),
    )


def point_at_distance(coordinates, target_miles):
    if not coordinates:
        return None

    if target_miles <= 0:
        lon, lat = coordinates[0]
        return {
            "lat": lat,
            "lon": lon,
        }

    travelled = 0.0

    for index in range(1, len(coordinates)):
        previous = coordinates[index - 1]
        current = coordinates[index]

        segment = haversine_miles(
            previous,
            current,
        )

        if travelled + segment >= target_miles:
            if segment == 0:
                lon, lat = current
            else:
                ratio = (
                    target_miles - travelled
                ) / segment

                lon = (
                    previous[0]
                    + (current[0] - previous[0]) * ratio
                )

                lat = (
                    previous[1]
                    + (current[1] - previous[1]) * ratio
                )

            return {
                "lat": lat,
                "lon": lon,
            }

        travelled += segment

    lon, lat = coordinates[-1]

    return {
        "lat": lat,
        "lon": lon,
    }


def generate_route_stops(
    events,
    route_geometry,
    total_distance,
    total_driving_hours,
):
    coordinates = route_geometry["coordinates"]

    stops = []

    driving_completed = 0.0

    for event in events:
        if event["status"] == "driving":
            driving_completed += event["duration"]
            continue

        if event["label"] not in (
            "30-minute rest break",
            "10-hour required rest",
            "Fuel stop",
        ):
            continue

        if total_driving_hours <= 0:
            continue

        progress = min(
            driving_completed / total_driving_hours,
            1.0,
        )

        distance = progress * total_distance

        position = point_at_distance(
            coordinates,
            distance,
        )

        if position:
            stops.append({
                "type": stop_type(event["label"]),
                "label": event["label"],
                "duration": event["duration"],
                "distance_miles": round(distance, 1),
                **position,
            })

    return stops


def stop_type(label):
    if label == "Fuel stop":
        return "fuel"

    if label == "30-minute rest break":
        return "break"

    return "rest"