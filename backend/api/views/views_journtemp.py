from django.shortcuts import render, get_object_or_404
# from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, views
from ..models import TRTemplate, TRTemplateDetails, ChartOfAccs, TransactionType
from ..serializers import TRTemplateSerializer, TRTemplateDetailsSerializer, ChartOfAccsSerializer, TransactionTypeSerializer
from django.http import JsonResponse


# Chart of Accounts List View
class ChartOfAccsListView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        charts = ChartOfAccs.objects.all()
        serializer = ChartOfAccsSerializer(charts, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

class TransactionTypeGet(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        transaction_type = TransactionType.objects.all()
        serializer = TransactionTypeSerializer(transaction_type, many=True)
        return JsonResponse(serializer.data, safe=False)

# List and Create Journal Templates
class JournalTemplateView(views.APIView):
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
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Retrieve, Update, Delete Journal Template
class JournalTemplateDetailView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk=None):
        if pk is None:
            return JsonResponse({"error": "Template ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        template = get_object_or_404(TRTemplate, pk=pk)
        template_serializer = TRTemplateSerializer(template)

        # Fetch related template details
        details = TRTemplateDetails.objects.filter(Template_FK=template)
        details_serializer = TRTemplateDetailsSerializer(details, many=True)

        # Combine template and details
        response_data = {
            "template": template_serializer.data,
            "details": details_serializer.data
        }

        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            return JsonResponse(response_data, safe=False, status=status.HTTP_200_OK)

        return JsonResponse(response_data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        # Extract template and details data
        template_data = request.data.get('template')
        details_data = request.data.get('details', [])

        if not template_data:
            return JsonResponse({"error": "Template data is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Update the template
        template = get_object_or_404(TRTemplate, pk=pk)
        template_serializer = TRTemplateSerializer(template, data=template_data)

        if template_serializer.is_valid():
            template_serializer.save()
        else:
            return JsonResponse(template_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Update or create details
        detail_errors = []
        for detail_data in details_data:
            detail_id = detail_data.get('id')
            if detail_id:  # Update existing detail
                detail = get_object_or_404(TRTemplateDetails, pk=detail_id)
                detail_serializer = TRTemplateDetailsSerializer(detail, data=detail_data)
                if detail_serializer.is_valid():
                    detail_serializer.save()
                else:
                    detail_errors.append(detail_serializer.errors)
            else:  # Create new detail
                detail_data['Template_FK'] = pk
                detail_serializer = TRTemplateDetailsSerializer(data=detail_data)
                if detail_serializer.is_valid():
                    detail_serializer.save()
                else:
                    detail_errors.append(detail_serializer.errors)

        if detail_errors:
            return JsonResponse({"detail_errors": detail_errors}, status=status.HTTP_400_BAD_REQUEST)

        # Return the updated template data
        response_data = {
            "template": template_serializer.data,
            "details": [
                TRTemplateDetailsSerializer(detail).data for detail in TRTemplateDetails.objects.filter(Template_FK=template)
            ],
        }
        return JsonResponse(response_data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        template = get_object_or_404(TRTemplate, pk=pk)
        serializer = TRTemplateSerializer(template, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        template = get_object_or_404(TRTemplate, pk=pk)
        template.delete()
        return JsonResponse(
            {"message": "Journal Template deleted successfully"}, status=status.HTTP_204_NO_CONTENT,)


# List and Create TRTemplateDetails
class TemplateBodyView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        details = TRTemplateDetails.objects.all()
        serializer = TRTemplateDetailsSerializer(details, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TRTemplateDetailsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Retrieve, Update, Delete TRTemplateDetail
class TemplateBodyDetailView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        detail = get_object_or_404(TRTemplateDetails, pk=pk)
        serializer = TRTemplateDetailsSerializer(detail)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    def put(self, request, pk):
        detail = get_object_or_404(TRTemplateDetails, pk=pk)
        serializer = TRTemplateDetailsSerializer(detail, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        detail = get_object_or_404(TRTemplateDetails, pk=pk)
        serializer = TRTemplateDetailsSerializer(detail, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        detail = get_object_or_404(TRTemplateDetails, pk=pk)
        detail.delete()
        return JsonResponse(
            {"message": "TRTemplateDetail deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )
