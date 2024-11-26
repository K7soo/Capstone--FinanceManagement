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

def journal_temp_view(request):
    pass

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

