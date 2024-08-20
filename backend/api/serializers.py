from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Table, FoodItem, Reservation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", 
            "username", 
            "password"
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = [
            "table_Name",
            "is_reserved",
            "created_at",
            "author"
        ]
        extra_kwargs = {"table_author": {"read_only": True}}

class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = [
            "food_Name",
            "price",
            "created_at",
            "author"
        ]
        extra_kwargs = {"foodItem_author": {"read_only": True}}

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = [
            "food_Name",
            "price",
            "created_at",
            "reservation_author"
        ]
        extra_kwargs = {"reservation_author": {"read_only": True}}


## Test Serializers

# class TableSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Table
#         fields = '__all__'

# class FoodItemSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FoodItem
#         fields = '__all__'

# class ReservationSerializer(serializers.ModelSerializer):
#     total_price = serializers.ReadOnlyField()

#     class Meta:
#         model = Reservation
#         fields = '__all__'