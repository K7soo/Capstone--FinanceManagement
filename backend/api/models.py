from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class Table(models.Model):
    table_Name = models.CharField(max_length=100)
    is_reserved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    table_author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tables")

    def __str__(self):
        return self.table_Name

class FoodItem(models.Model):
    food_Name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateField(auto_now_add=True)

    foodItem_author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="fooditems")

    def __str__(self):
        return self.food_Name

class Reservation(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    food_items = models.ManyToManyField(FoodItem)
    reserved_at = models.DateTimeField(auto_now_add=True)
    reserved_by = models.CharField(max_length=100)

    reservation_author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reservations")