from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..models import TRTemplate, TRTemplateDetails, ChartOfAccs
from ..serializers import TRTemplateSerializer, TRTemplateDetailsSerializer, ChartOfAccsSerializer
from django.http import JsonResponse


# Chart of Accounts List View
class ChartOfAccsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        charts = ChartOfAccs.objects.all()
        serializer = ChartOfAccsSerializer(charts, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)


# CRUD for TRTemplateDetails
class TRTemplateDetailsView(APIView):
    permission_classes = [AllowAny]

    # List all TRTemplateDetails
    def get(self, request):
        details = TRTemplateDetails.objects.select_related('Account_FK', 'TRTemplate_FK').all()
        serializer = TRTemplateDetailsSerializer(details, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    # Create a new TRTemplateDetail
    def post(self, request):
        serializer = TRTemplateDetailsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TRTemplateDetailsDetailView(APIView):
    permission_classes = [AllowAny]

    # Retrieve a specific TRTemplateDetail
    def get(self, request, pk):
        try:
            detail = TRTemplateDetails.objects.select_related('Account_FK', 'TRTemplate_FK').get(pk=pk)
            serializer = TRTemplateDetailsSerializer(detail)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
        except TRTemplateDetails.DoesNotExist:
            return JsonResponse(
                {"error": "TRTemplateDetail not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    # Update (full) a specific TRTemplateDetail
    def put(self, request, pk):
        try:
            detail = TRTemplateDetails.objects.get(pk=pk)
            serializer = TRTemplateDetailsSerializer(detail, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except TRTemplateDetails.DoesNotExist:
            return JsonResponse(
                {"error": "TRTemplateDetail not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    # Partial Update (patch) a specific TRTemplateDetail
    def patch(self, request, pk):
        try:
            detail = TRTemplateDetails.objects.get(pk=pk)
            serializer = TRTemplateDetailsSerializer(detail, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except TRTemplateDetails.DoesNotExist:
            return JsonResponse(
                {"error": "TRTemplateDetail not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    # Delete a specific TRTemplateDetail
    def delete(self, request, pk):
        try:
            detail = TRTemplateDetails.objects.get(pk=pk)
            detail.delete()
            return JsonResponse(
                {"message": "TRTemplateDetail deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except TRTemplateDetails.DoesNotExist:
            return JsonResponse(
                {"error": "TRTemplateDetail not found"},
                status=status.HTTP_404_NOT_FOUND,
            )


# List and Create Journal Templates
class JournalTemplatesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            templates = TRTemplate.objects.prefetch_related('details__Account_FK').all()
            serializer = TRTemplateSerializer(templates, many=True)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

        templates = TRTemplate.objects.prefetch_related('details__Account_FK').all()
        serializer = TRTemplateSerializer(templates, many=True)
        return render(
            request,
            'journaltemp.html',
            {'JournalTemplate': serializer.data},
        )

    def post(self, request):
        serializer = TRTemplateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Save the TRTemplate with nested TRTemplateDetails
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Retrieve, Update, Delete Journal Template
class JournalTemplatesDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            template = TRTemplate.objects.prefetch_related('details__Account_FK').get(pk=pk)
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
                serializer.save()
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
                serializer.save()
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
