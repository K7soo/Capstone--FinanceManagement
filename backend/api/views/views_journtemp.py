from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..models import TRTemplate, ChartOfAccs
from ..serializers import TRTemplateSerializer, ChartOfAccsSerializer
from django.http import JsonResponse


# Chart of Accounts List View
class ChartOfAccsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        charts = ChartOfAccs.objects.all().values('id', 'AccountCode')  # Fetch only necessary fields
        serializer = ChartOfAccsSerializer(charts, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)


# List and Create Journal Templates
class JournalTemplatesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            templates = TRTemplate.objects.prefetch_related('details').all()
            serializer = TRTemplateSerializer(templates, many=True)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

        templates = TRTemplate.objects.prefetch_related('details').all()
        serializer = TRTemplateSerializer(templates, many=True)
        return render(
            request,
            'journaltemp.html',
            {'JournalTemplate': serializer.data},
        )

    def post(self, request):
        serializer = TRTemplateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Handles nested creation via the serializer
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Retrieve, Update, Delete Journal Template
class JournalTemplatesDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            template = TRTemplate.objects.prefetch_related('details').get(pk=pk)
            serializer = TRTemplateSerializer(template)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
        except TRTemplate.DoesNotExist:
            return JsonResponse(
                {"error": "Journal Template not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    def put(self, request, pk):
        try:
            template = TRTemplate.objects.get(pk=pk)
            serializer = TRTemplateSerializer(template, data=request.data)
            if serializer.is_valid():
                serializer.save()  # Handles nested updates via the serializer
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except TRTemplate.DoesNotExist:
            return JsonResponse(
                {"error": "Journal Template not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    def patch(self, request, pk):
        try:
            template = TRTemplate.objects.get(pk=pk)
            serializer = TRTemplateSerializer(template, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()  # Handles partial updates
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except TRTemplate.DoesNotExist:
            return JsonResponse(
                {"error": "Journal Template not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    def delete(self, request, pk):
        try:
            template = TRTemplate.objects.get(pk=pk)
            template.delete()  # Automatically cascades and deletes associated TRTemplateDetails
            return JsonResponse(
                {"message": "Journal Template deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except TRTemplate.DoesNotExist:
            return JsonResponse(
                {"error": "Journal Template not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
