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
        details = TRTemplateDetails.objects.select_related('Account_FK', 'Template_FK').all()
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
        detail = get_object_or_404(TRTemplateDetails, pk=pk)
        serializer = TRTemplateDetailsSerializer(detail)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    # Update (full) a specific TRTemplateDetail
    def put(self, request, pk):
        detail = get_object_or_404(TRTemplateDetails, pk=pk)
        serializer = TRTemplateDetailsSerializer(detail, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Partial Update (patch) a specific TRTemplateDetail
    def patch(self, request, pk):
        detail = get_object_or_404(TRTemplateDetails, pk=pk)
        serializer = TRTemplateDetailsSerializer(detail, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Delete a specific TRTemplateDetail
    def delete(self, request, pk):
        detail = get_object_or_404(TRTemplateDetails, pk=pk)
        detail.delete()
        return JsonResponse(
            {"message": "TRTemplateDetail deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )


# List and Create Journal Templates
class JournalTemplatesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        templates = TRTemplate.objects.all()
        serializer = TRTemplateSerializer(templates, many=True)
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
        return render(request, 'journaltemp.html', {'JournalTemplate': serializer.data})

    def post(self, request):
        serializer = TRTemplateSerializer(data=request.data)
        if serializer.is_valid():
            template = serializer.save()

            # Handle nested TRTemplateDetails
            if 'details' in request.data:
                details_data = request.data['details']
                for detail_data in details_data:
                    detail_data['Template_FK'] = template.id
                    detail_serializer = TRTemplateDetailsSerializer(data=detail_data)
                    if detail_serializer.is_valid():
                        detail_serializer.save()
                    else:
                        return JsonResponse(detail_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Retrieve, Update, Delete Journal Template
class JournalTemplatesDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        template = get_object_or_404(TRTemplate, pk=pk)
        serializer = TRTemplateSerializer(template)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    def put(self, request, pk):
        template = get_object_or_404(TRTemplate, pk=pk)
        serializer = TRTemplateSerializer(template, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        template = get_object_or_404(TRTemplate, pk=pk)
        serializer = TRTemplateSerializer(template, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        template = get_object_or_404(TRTemplate, pk=pk)
        template.delete()  # Automatically cascades and deletes associated TRTemplateDetails
        return JsonResponse(
            {"message": "Journal Template deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )
