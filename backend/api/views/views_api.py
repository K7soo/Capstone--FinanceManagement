import requests
from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import status, views
from rest_framework.permissions import AllowAny


class ReservationsView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # URL for the API hosted on Laptop 1
        api_url = "http://192.168.1.28:8000/reservations/"
        
        try:
            response = requests.get(api_url)
            response.raise_for_status()  # Raise an error for bad responses (4xx and 5xx)
            reservations = response.json()

        except requests.RequestException as e:
            print(f"Error fetching data from API: {e}")
            return JsonResponse(
                {"error": "Error retrieving data from the external API."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return render(request, "reservations.html", {'reservations': reservations})
