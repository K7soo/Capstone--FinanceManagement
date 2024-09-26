from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets
from .models import TRTemplateDetails, TransactionDetails, Transactions, TRTemplate, TransactionType, ChartOfAccs, AccountType, Discounts, Payments, PaymentGateway
from .serializers import UserSerializer, TRTemplateDetailsSerializer, TransactionDetailsSerializer, TransactionsSerializer, TRTemplateSerializer, TransactionTypeSerializer, ChartOfAccsSerializer, AccountTypeSerializer, DiscountsSerializer, PaymentsSerializer, PaymentGatewaySerializer

def sidebar_view(request):
    return render(request, 'sidebar.html')

def dashboard_view(request):
    return render(request, 'dashboard.html')

def bookkeeping_view(request):
    return render(request, 'bookkeeping.html')

# Dropdown Button Components
def chart_of_accounts_view(request):
    return render(request, 'chartofacc.html')

def journal_templates_view(request):
    return render(request, 'journaltemp.html')

def journal_entries_view(request):
    return render(request, 'journalentries.html')

def trial_balance_view(request):
    return render(request, 'trialbalance.html')
# end of dropdown 
def menubar_view(request):
    return render(request, 'menubar.html')

def payment_view(request):
    return render(request, 'payment.html')

def reports_view(request):
    return render(request, 'reports.html')

class TRTemplateDetailsViewSet(viewsets.ModelViewSet):
    queryset = TRTemplateDetails.objects.all()
    serializer_class = TRTemplateDetailsSerializer

class TransactionDetailsViewSet(viewsets.ModelViewSet):
    queryset = TransactionDetails.objects.all()
    serializer_class = TransactionDetailsSerializer

class TransactionsViewSet(viewsets.ModelViewSet):
    queryset = Transactions.objects.all()
    serializer_class = TransactionsSerializer

class TRTemplateViewSet(viewsets.ModelViewSet):
    queryset = TRTemplate.objects.all()
    serializer_class = TRTemplateSerializer

class TransactionTypeViewSet(viewsets.ModelViewSet):
    queryset = TransactionType.objects.all()
    serializer_class = TransactionTypeSerializer

class ChartOfAccsViewSet(viewsets.ModelViewSet):
    queryset = ChartOfAccs.objects.all()
    serializer_class = ChartOfAccsSerializer

class AccountTypeViewSet(viewsets.ModelViewSet):
    queryset = AccountType.objects.all()
    serializer_class = AccountTypeSerializer

class DiscountsViewSet(viewsets.ModelViewSet):
    queryset = Discounts.objects.all()
    serializer_class = DiscountsSerializer

class PaymentsViewSet(viewsets.ModelViewSet):
    queryset = Payments.objects.all()
    serializer_class = PaymentsSerializer

class PaymentGatewayViewSet(viewsets.ModelViewSet):
    queryset = PaymentGateway.objects.all()
    serializer_class = PaymentGatewaySerializer

# User-Auth View
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

