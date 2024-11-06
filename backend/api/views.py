from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import JSONParser
from .models import *
from .serializers import *

# dashboard view
def dashboard_view(request):
    return render(request, 'dashboard.html')

# sidebar view 
def sidebar_view(request):
    return render(request, 'sidebar.html')

# menubar view
def menubar_view(request):
    return render(request, 'menubar.html')

#bookkeeping sidebar button
def bookkeeping_view(request):
    return render(request, 'bookkeeping.html')

#transaction inbox sidebar button
def transaction_inbox_view(request):
    return render(request, 'trinbox.html')


# Dropdown Button Components
# CRUD Accounts
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def crud_accounts_view(request):
    # Handle GET requests
    if request.method == 'GET' and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        # Fetch and return JSON data for AJAX GET requests
        account_records = AccountType.objects.all()
        serialized_accounts = AccountTypeSerializer(account_records, many=True)
        return JsonResponse(serialized_accounts.data, safe=False)

    if request.method == 'GET':
        # Render HTML template for non-AJAX GET requests
        account_records = AccountType.objects.all()
        serialized_accounts = AccountTypeSerializer(account_records, many=True)
        return render(request, 'crudacc.html', {'Accounts': serialized_accounts.data})

    # Handle POST requests
    if request.method == 'POST':
        # Parse JSON data from the AJAX POST request
        request_data = JSONParser().parse(request)
        account_serializer = AccountTypeSerializer(data=request_data)
        print("parsing data")

        # Validate and save the new account if the data is valid
        if account_serializer.is_valid():
            account_serializer.save()
            print("Save successful")
            # Return the newly created account data as JSON
            return JsonResponse(account_serializer.data, status=201)
        
        print("Pass here if data is not saved")
        return JsonResponse(account_serializer.errors, status=400) 

# CRUD Chart of Accounts
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def chart_of_accounts_view(request):
    if request.method == "GET":
        ChartOfAccounts = ChartOfAccs.objects.all()
        serializer = ChartOfAccsSerializer(ChartOfAccounts, many=True)
        return render(request, 'chartofacc.html', {'ChartOfAccounts': serializer.data})
    
    if request.method == "POST":
        serializer = ChartOfAccsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return render(request, 'chartofacc.html', serializer.data)


def journal_templates_view(request):
    return render(request, 'journaltemp.html')

def journal_entries_view(request):
    return render(request, 'journalentries.html')

def trial_balance_view(request):
    return render(request, 'trialbalance.html')
# End of dropdown 

def payment_view(request):
    return render(request, 'payment.html')

def reports_view(request):
    return render(request, 'reports.html')

# User-Auth View
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

