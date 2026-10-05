# ELD Trip Planner

A full-stack trip planning application for property-carrying commercial drivers. The application calculates a route, generates daily driving schedules, and visualizes estimated Hours of Service (HOS) activity.

## Features

- Route planning between pickup and delivery locations
- Location search and route visualization
- Estimated trip distance and duration
- Driver Hours of Service calculations
- Daily driving schedule generation
- ELD-style log visualization
- Responsive React interface
- REST API backend

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS

### Backend
- Python
- Django
- Django REST Framework

### Routing
- OSRM (Open Source Routing Machine)

## Architecture

```text
React / TypeScript
        |
        | REST API
        v
Django REST Framework
        |
        +---- HOS calculation logic
        |
        +---- Route processing
        |
        v
      OSRM
```

## Getting Started

### Clone the repository

```bash
git clone https://github.com/intellectual1010/spotter-eld-trip-planner.git
cd spotter-eld-trip-planner
```

### Backend

Create and activate a virtual environment:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start Django:

```bash
python manage.py runserver
```

### Frontend

Open the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## API

The backend exposes REST endpoints for trip calculations and location-related operations.

Example:

```text
POST /api/calculate/
GET  /api/locations/
```

The exact request/response structure is defined by the Django REST Framework implementation in this repository.

## HOS Calculations

The application estimates a driver's trip schedule using Hours of Service constraints and divides longer trips into daily driving periods.

The generated logs are intended as a software demonstration and should not be treated as certified ELD records or legal/compliance advice.

## Deployment

The frontend can be deployed independently from the Django API. Make sure the frontend API configuration points to the deployed backend.

## Purpose

This project demonstrates:

- Full-stack application development
- React and TypeScript
- Django REST API development
- Route API integration
- Business-rule implementation
- Responsive UI development

## License

This project is intended for portfolio and demonstration purposes.