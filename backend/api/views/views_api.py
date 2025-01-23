import requests
from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status, views
from rest_framework.permissions import AllowAny
from ..serializers import *
from ..models import *

class PaymentRecordRetrieveView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            # Return JSON response for AJAX requests
            records = PaymentRecord.objects.all()
            serializer = PaymentRecordSerializer(records, many=True)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

        # Return rendered HTML for non-AJAX requests
        records = PaymentRecord.objects.all()
        serializer = PaymentRecordSerializer(records, many=True)
        return render(request, "Transaction/trinbox.html", {"PaymentRecord": serializer.data})
    

class PaymentRecordView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        # Retrieve all payment records or filter by query parameters if provided
        transaction_id = request.query_params.get('transaction_id', None)
        if transaction_id:
            records = PaymentRecord.objects.filter(transaction_id=transaction_id)
        else:
            records = PaymentRecord.objects.all()
        
        serializer = PaymentRecordSerializer(records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = PaymentRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Payment record saved successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReservationsView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # URL for the API hosted on Laptop 1
        api_url = "http://192.168.1.82:8000/reservations/"
        
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

        return render(request, "trinbox.html", {'reservations': reservations})

class OrderManagementView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # URL for the API hosted on Laptop 1
        api_url = "http://192.168.1.82:8000/logistics/"
        
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

        return render(request, "trinbox.html", {'ManageOrder': ManageOrder})
