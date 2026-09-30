from django.urls import path
from .views import calculate_trip, location_search

urlpatterns = [
    path("calculate/", calculate_trip, name="calculate-trip"),
    path("locations/", location_search, name="location-search"),
]