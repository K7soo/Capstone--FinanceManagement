from django.shortcuts import render
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import *
from .serializers import *
import json

# Main Page Rendering
def sidebar_view(request):
    return render(request, 'sidebar.html')

def dashboard_view(request):
    return render(request, 'dashboard.html')

def bookkeeping_view(request):
    return render(request, 'bookkeeping.html')

# Dropdown Button Components
def chart_of_accounts_view(request):
    # READ METHOD
    if request.method == 'GET':
        my_data = ChartOfAccs.objects.all().values()
        context = {
            'my_data': my_data
        }
        return render(context, 'chartofacc.html', request)
    
    if request.method == 'PUT':
        # return render(request, 'chartofacc.html')
        pass

    if request.method == 'PATCH':
        # return render(request, 'chartofacc.html')
        pass

    # CREATE METHOD
    if request.method == 'POST':
        # Parse the incoming JSON data
        data = json.loads(request.body)

        # Extract the data
        account_code = data.get('accountCode')
        account_desc = data.get('accountDesc')
        nature_flag = data.get('natureFlag')
        account_type = data.get('accountType')

        # Save the data to the database
        try:
            chartofaccs = ChartOfAccs.objects.create(
                account_code = account_code,
                account_desc = account_desc,
                nature_flag = nature_flag,
                account_type = account_type
            )
            return JsonResponse({'status': 'success', 'data': {'id': chartofaccs.id}})
        
        except Exception as e:
            return JsonResponse({'status': 'error', 'errors': str(e)}, status=400)
    return JsonResponse({'status': 'invalid_request'}, status=400)


def journal_templates_view(request):
    return render(request, 'journaltemp.html')

def journal_entries_view(request):
    return render(request, 'journalentries.html')

def trial_balance_view(request):
    return render(request, 'trialbalance.html')
# End of dropdown 

def menubar_view(request):
    return render(request, 'menubar.html')

def payment_view(request):
    return render(request, 'payment.html')

def reports_view(request):
    return render(request, 'reports.html')

# User-Auth View
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

