from django.db import models
from django.contrib.auth.models import User


class TRTemplateDetails(models.Model):
    TRTemplate = models.ForeignKey('TRTemplate', on_delete=models.CASCADE)
    DC_Flag = models.BooleanField()
    Account = models.ForeignKey('ChartOfAccs', on_delete=models.CASCADE)

class TransactionDetails(models.Model):
    Transaction = models.ForeignKey('Transactions', on_delete=models.CASCADE)
    Account = models.ForeignKey('ChartOfAccs', on_delete=models.CASCADE)
    DebitAmount = models.DecimalField(max_digits=10, decimal_places=2)
    CreditAmount = models.DecimalField(max_digits=10, decimal_places=2)

class Transactions(models.Model):
    TransactionType = models.ForeignKey('TransactionType', on_delete=models.CASCADE)
    TRTemplate = models.ForeignKey('TRTemplate', on_delete=models.CASCADE, null=True, blank=True)
    TransactionNo = models.CharField(max_length=100)
    TransactionStatus = models.CharField(max_length=50)
    Discount = models.ForeignKey('Discounts', on_delete=models.SET_NULL, null=True, blank=True)
    Payment = models.ForeignKey('Payments', on_delete=models.SET_NULL, null=True, blank=True)
    Particulars = models.TextField()
    Created_By = models.CharField(max_length=100)
    Reviewed_By = models.CharField(max_length=100)
    Date_Reviewed = models.DateField(null=True, blank=True)
    Date_Cancelled = models.DateField(null=True, blank=True)
    TransactionDate = models.DateField()

class TRTemplate(models.Model):
    TransactionType = models.ForeignKey('TransactionType', on_delete=models.CASCADE)
    Particulars = models.TextField()

class TransactionType(models.Model):
    Reservation = models.IntegerField(null=True, blank=True)
    ProductOrder = models.IntegerField(null=True, blank=True)
    Order = models.IntegerField(null=True, blank=True)
    TransactionCode = models.CharField(max_length=100)
    TransactionTypeDesc = models.TextField()

class ChartOfAccs(models.Model):
    AccountType = models.ForeignKey('AccountType', on_delete=models.CASCADE)
    AccountCode = models.CharField(max_length=100)
    AccountDesc = models.TextField()
    NatureFlag = models.BooleanField()
    Created_At = models.DateField(auto_now_add=True)

class AccountType(models.Model):
    AccountName = models.CharField(max_length=100)
    AccountType = models.CharField(max_length=50)
    Created_At = models.DateField(auto_now_add=True)

class Discounts(models.Model):
    DiscountCode = models.CharField(max_length=50)
    DiscountDesc = models.TextField()
    DiscountType = models.CharField(max_length=50)
    DiscountValue = models.DecimalField(max_digits=5, decimal_places=2)
    StartDate = models.DateField()
    EndDate = models.DateField()

class Payments(models.Model):
    Gateway = models.ForeignKey('PaymentGateway', on_delete=models.CASCADE)
    PaymentAmount = models.DecimalField(max_digits=10, decimal_places=2)
    PaymentType = models.CharField(max_length=50)
    PaymentDate = models.DateField()

class PaymentGateway(models.Model):
    GatewayName = models.CharField(max_length=100)
    GatewayDetails = models.TextField()
    Created_At = models.DateField(auto_now_add=True)

