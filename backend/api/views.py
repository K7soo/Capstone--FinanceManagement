from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import *
from .serializers import *

# from django.views.decorators.csrf import csrf_exempt (this is for testing)

# Dashboard view
def dashboard_view(request):
    return render(request, 'dashboard.html')

# Dropdown Button Components #
# CRUD List of Accounts
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def list_of_accounts_view(request):
    # Fetch and return JSON data for AJAX GET requests
    if request.method == 'GET' and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        account_records = AccountType.objects.all()
        serializer = AccountTypeSerializer(account_records, many=True)
        return JsonResponse(serializer.data, safe=False)

    if request.method == 'GET':
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            accounts = AccountType.objects.all()
            serializer = AccountTypeSerializer(accounts, many=True)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

        accounts = AccountType.objects.all()
        serializer = AccountTypeSerializer(accounts, many=True)
        return render(request, 'listofacc.html', {'Accounts': serializer.data})

    if request.method == "POST":
        print("Received POST request with data:", request.data)
        serializer = AccountTypeSerializer(data=request.data)
    
        if serializer.is_valid():
            print("Data is valid, saving to database.")
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
    
    print("Validation failed:", serializer.errors)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def list_of_accounts_change(request, pk=None):
    # Handle AJAX GET request
    if request.method == 'GET':
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            accounts = AccountType.objects.all()
            serializer = AccountTypeSerializer(accounts, many=True)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    # Handle DELETE request to delete a specific account by ID
    if request.method == 'DELETE' and pk:
        try:
            account = AccountType.objects.get(pk=pk)
            account.delete()
            return Response({'message': 'Account deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except AccountType.DoesNotExist:
            return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)
        
    if request.method == 'PUT' and pk:
        try:
            account = AccountType.objects.get(pk=pk)
            serializer = AccountTypeSerializer(account, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except AccountType.DoesNotExist:
            return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)


# CRUD Chart of Accounts
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def chart_of_accounts_view(request):
    if request.method == 'GET' and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        chart_of_account = ChartOfAccs.objects.all()
        serializer = ChartOfAccsSerializer(chart_of_account, many=True)
        return JsonResponse(serializer.data, safe=False)
        
    if request.method == 'GET':
        chart_of_account = ChartOfAccs.objects.all()
        serializer = ChartOfAccsSerializer(chart_of_account, many=True)
        return render(request, 'chartofacc.html', {'ChartOfAccounts': serializer.data})

    if request.method == 'POST':
        serializer = ChartOfAccsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([AllowAny])
def chart_of_account_detail_view(request, pk):
    # Retrieve the specific Chart of Account instance
    chart_of_account = get_object_or_404(ChartOfAccs, pk=pk)

    if request.method == 'GET':
        serializer = ChartOfAccsSerializer(chart_of_account)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)

    if request.method in ['PUT', 'PATCH']:
        partial_update = (request.method == 'PATCH')
        serializer = ChartOfAccsSerializer(chart_of_account, data=request.data, partial=partial_update)
        
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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


# Authentication Rendering #
def admin_login_view(request):
    return render(request, 'admin_login.html')

# User-Auth View # 
# DO NOT TOUCH #
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

