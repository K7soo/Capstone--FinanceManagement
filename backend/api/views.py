from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets
from .models import TRTemplateDetails, TransactionDetails, Transactions, TRTemplate, TransactionType, ChartOfAccs, AccountType, Discounts, Payments, PaymentGateway
from .serializers import UserSerializer, TRTemplateDetailsSerializer, TransactionDetailsSerializer, TransactionsSerializer, TRTemplateSerializer, TransactionTypeSerializer, ChartOfAccsSerializer, AccountTypeSerializer, DiscountsSerializer, PaymentsSerializer, PaymentGatewaySerializer

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

