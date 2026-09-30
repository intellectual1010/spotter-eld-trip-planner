# Spotter ELD Trip Planner

A full-stack trip planning application for property-carrying commercial drivers. The application calculates a route, applies Hours of Service (HOS) planning rules, identifies required breaks/rest periods, and generates daily driver log visualizations.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Leaflet
- OpenStreetMap

### Backend
- Python
- Django
- Django REST Framework
- OSRM routing
- Nominatim geocoding

## Features

- Current location, pickup location, and drop-off inputs
- Current 70-hour cycle usage input
- Route distance and estimated driving time
- Interactive route map
- Pickup and drop-off handling
- 30-minute break scheduling
- 11-hour driving-limit handling
- 14-hour driving-window handling
- 10-hour rest periods
- 70-hour / 8-day cycle planning
- 34-hour restart planning when remaining cycle hours are insufficient
- Fuel-stop planning for long trips
- HOS schedule timeline
- Daily 24-hour ELD log generation
- Multiple daily log sheets for multi-day trips
- Responsive UI and input validation

## Assessment Assumptions

The planner uses the following assumptions:

- Property-carrying commercial driver
- 70-hour / 8-day cycle
- No adverse driving conditions
- Pickup requires 1 hour of on-duty time
- Drop-off requires 1 hour of on-duty time
- Fueling is planned at least every 1,000 miles
- A fuel stop is modeled as 30 minutes of on-duty time
- The calculated trip begins at 00:00 on Day 1 for generated log visualization

Because the application receives only the driver's current cycle-used hours rather than the complete previous eight days of duty history, it cannot reconstruct the rolling 70-hour calculation. When the supplied remaining cycle hours are insufficient, the planner uses a 34-hour restart as a planning strategy before additional on-duty/driving time.

Route stop positions shown on the map are approximate positions along the calculated route. They do not represent specific truck stops, parking facilities, or fuel stations.

## HOS Planning

The scheduling engine accounts for:

- Maximum 11 hours of driving following a qualifying rest period
- 14-hour driving window
- 30-minute non-driving break after 8 cumulative hours of driving
- 10-hour qualifying rest periods
- 70-hour cycle availability
- Pickup, drop-off, and fuel on-duty time

The application is a trip-planning demonstration and is not a certified Electronic Logging Device.

## Local Development

### Backend

```bash
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver