from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from ..models import *
from ..serializers import *

# from django.views.decorators.csrf import csrf_exempt (this is for testing)

# Authentication Rendering #
def admin_login_view(request):
    return render(request, 'admin_login.html')

# Dashboard view
def dashboard_view(request):
    return render(request, 'dashboard.html')

# Dropdown Button Components #
# CRUD Journal Templates
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def journal_templates_view(request):
    if request.method == 'GET' and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        # Fetch and return JSON data for AJAX GET requests
        journal_template = TRTemplate.objects.all()
        serializer = TRTemplateSerializer(journal_template, many=True)
        return JsonResponse(serializer.data, safe=False)

    if request.method == 'GET':
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            journal_template = TRTemplate.objects.all()
            serializer = TRTemplateSerializer(journal_template, many=True)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

        journal_template = TRTemplate.objects.all()
        serializer = TRTemplateSerializer(journal_template, many=True)
        return render(request, 'journaltemp.html', {'JournalTemplate': serializer.data})

    if request.method == 'POST':
        serializer = TRTemplateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def journal_templates_change(request, pk=None):
    # Handle AJAX GET request
    if request.method == 'GET':
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            journal_template = TRTemplate.objects.all()
            serializer = TRTemplateSerializer(journal_template, many=True)
            return JsonResponse(serializer.data, safe=False)

    # Handle DELETE request to delete a specific account by ID
    if request.method == 'DELETE' and pk:
        try:
            journal_template = TRTemplate.objects.get(pk=pk)
            journal_template.delete()
            return Response({'message': 'Template deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except TRTemplate.DoesNotExist:
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)
        
    if request.method == 'PUT' and pk:
        try:
            journal_template = TRTemplate.objects.get(pk=pk)
            serializer = TRTemplateSerializer(journal_template, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except TRTemplate.DoesNotExist:
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)


# Transaction inbox sidebar button
def transaction_inbox_view(request):
    return render(request, 'trinbox.html')

def journal_entries_view(request):
    return render(request, 'journalentries.html')

def jev_approval_view(request):
    return render(request, 'jevapproval.html')

def trial_balance_view(request):
    return render(request, 'trialbalance.html')
# End of dropdown 

def payment_view(request):
    return render(request, 'payment.html')

def reports_view(request):
    return render(request, 'reports.html')

# sidebar view 
def sidebar_view(request):
    return render(request, 'sidebar.html')
# menubar view
def menubar_view(request):
    return render(request, 'menubar.html')
#bookkeeping sidebar button
def bookkeeping_view(request):
    return render(request, 'bookkeeping.html')

