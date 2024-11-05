from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
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

# Version 1
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def crud_accounts_view(request):
    if request.method == 'GET':
        Accounts = AccountType.objects.all()
        serializer = AccountTypeSerializer(Accounts, many=True)
        return render(request, 'crudacc.html', {'Accounts':serializer.data})
    
    if request.method == 'POST':
        serializer = AccountTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return render(request, 'crudacc.html', serializer.data)

# Version 2       
# @api_view(['GET'])
# def crud_accounts_view(request):
#     Accounts = AccountType.objects.all()
#     serializer = AccountTypeSerializer(Accounts, many=True)
#     return render(request, 'crudacc.html', {'Accounts':serializer.data})

# @api_view(['POST'])
# def crud_accounts_view(request):
#     serializer = AccountTypeSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return render(request, 'crudacc.html', serializer.data)    

def chart_of_accounts_view(request):
    return render(request, 'chartofacc.html')

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

