from django.shortcuts import render
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import *
from .serializers import *
from .views_charts import *

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
        return render(request, 'chartofacc.html', context)

    # FULL UPDATE METHOD
    if request.method == 'PUT':
        updated_account, error_response = update_chart_of_accounts(request)
        if error_response:
            return error_response  
        
        context = {'account': updated_account}
        return render(request, 'update_success.html', context)

    # PARTIAL UPDATE METHOD
    if request.method == 'PATCH':
        updated_account, error_response = patch_chart_of_accounts(request)
        if error_response:
            return error_response

        context = {'account': updated_account}
        return render(request, 'update_success.html', context)

    # CREATE METHOD (POST)
    if request.method == 'POST':
        new_account, error_response = create_chart_of_accounts(request)
        if error_response:
            return error_response

        context = {'account': new_account}
        return render(request, 'create_success.html', context)

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

