from django.urls import path
from . import views

urlpatterns = [
    path("tables/", views.TableListCreate.as_view(), name="table-list"),
    path("tables/delete/<int:pk>/", views.TableDelete.as_view(), name="delete-table"),
    path("reservations/", views.ReservationListCreate.as_view(), name="reservation-list"),
    path("reservations/delete/<int:pk>/", views.ReservationDelete.as_view(), name="delete-reservation"),
    path("fooditems/", views.FoodItemListCreate.as_view(), name="fooditem-list"),
    path("fooditems/delete/<int:pk>/", views.TableDelete.as_view(), name="delete-fooditem"),
]