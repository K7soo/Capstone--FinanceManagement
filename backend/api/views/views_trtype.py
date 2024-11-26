from django.http import JsonResponse
from rest_framework import status, views
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import render
from ..models import TransactionType
from ..serializers import TransactionTypeSerializer


class TransactionTypeView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            transaction_type = TransactionType.objects.all()
            serializer = TransactionTypeSerializer(transaction_type, many=True)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
        transaction_type = TransactionType.objects.all()
        serializer = TransactionTypeSerializer(transaction_type, many=True)
        return render(request, "trtype.html", {"TransactionType": serializer.data})

    def post(self, request):
        serializer = TransactionTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransactionTypeDetailView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            transaction_type = TransactionType.objects.get(pk=pk)
            serializer = TransactionTypeSerializer(transaction_type)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
        except TransactionType.DoesNotExist:
            return JsonResponse(
                {"error": "TransactionType not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def put(self, request, pk):
        try:
            transaction_type = TransactionType.objects.get(pk=pk)
            serializer = TransactionTypeSerializer(transaction_type, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except TransactionType.DoesNotExist:
            return JsonResponse(
                {"error": "TransactionType not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def patch(self, request, pk):
        try:
            transaction_type = TransactionType.objects.get(pk=pk)
            serializer = TransactionTypeSerializer(
                transaction_type, data=request.data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except TransactionType.DoesNotExist:
            return JsonResponse(
                {"error": "TransactionType not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def delete(self, request, pk):
        try:
            transaction_type = TransactionType.objects.get(pk=pk)
            transaction_type.delete()
            return JsonResponse(
                {"message": "TransactionType deleted successfully."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except TransactionType.DoesNotExist:
            return JsonResponse(
                {"error": "TransactionType not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
