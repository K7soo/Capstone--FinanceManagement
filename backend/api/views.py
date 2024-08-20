from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, TableSerializer, FoodItemSerializer, ReservationSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Table, FoodItem, Reservation

## List of Views per Serializer // Classes

# Table Views
class TableListCreate(generics.ListCreateAPIView):
    serializer_class = TableSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Table.objects.filter(table_author=user)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(table_author=self.request.user)
        else:
            print(serializer.errors)

class TableDelete(generics.DestroyAPIView):
    queryset = Table.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Table.objects.filter(table_author=user)
    
# Reservation Views
class ReservationListCreate(generics.ListCreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Reservation.objects.filter(reservation_author=user)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class ReservationDelete(generics.DestroyAPIView):
    queryset = Reservation.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Reservation.objects.filter(reservation_author=user)
    
#Food Items View
class FoodItemListCreate(generics.ListCreateAPIView):
    serializer_class = FoodItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return FoodItem.objects.filter(foodItem_author=user)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class FoodItemDelete(generics.DestroyAPIView):
    queryset = FoodItem.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return FoodItem.objects.filter(foodItem_author=user)


# User-Auth View
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

