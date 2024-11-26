from django.db import models
from django.contrib.auth.models import User


class TRTemplate(models.Model):
    TRTemplateCode = models.CharField(
        max_length=50, default=None, null=False, blank=False
    )
    TransactionType_FK = models.ForeignKey(
        "TransactionType", on_delete=models.CASCADE, null=False, blank=False, default=1
    )
    TRTemplateDetails_FK = models.ForeignKey(
        "TRTemplateDetails", on_delete=models.CASCADE, null=False, blank=False, default=1
    )

class TRTemplateDetails(models.Model):
    Account_FK = models.ForeignKey(
        "ChartOfAccs", on_delete=models.CASCADE, null=False, blank=False, default=1
    )
    DC_Flag = models.BooleanField(null=False, blank=False)


class TransactionType(models.Model):
    TransactionTypeName = models.CharField(
        max_length=50, null=False, blank=False, default=None
    )
    TransactionCode = models.CharField(max_length=100, null=False, blank=False)
    TransactionTypeDesc = models.TextField(null=False, blank=False)


class ChartOfAccs(models.Model):
    AccountType_FK = models.ForeignKey(
        "AccountType", on_delete=models.CASCADE, null=False, blank=False, default=1
    )
    AccountCode = models.CharField(max_length=100, null=False, blank=False)
    AccountDesc = models.TextField(null=False, blank=False)
    Created_At = models.DateField(auto_now_add=True, null=False, blank=False)


class AccountType(models.Model):
    AccountCode = models.CharField(max_length=50, null=False, blank=False)
    AccountTypeDesc = models.TextField(null=False, blank=False)
    Created_At = models.DateField(auto_now_add=True, null=False, blank=False)


class TransactionDetails(models.Model):
    Transaction_FK = models.ForeignKey(
        "Transactions", on_delete=models.CASCADE, null=False, blank=False, default=1
    )
    Account_FK = models.ForeignKey(
        "ChartOfAccs", on_delete=models.CASCADE, null=False, blank=False, default=1
    )
    DebitAmount = models.DecimalField(
        max_digits=10, decimal_places=2, null=False, blank=False
    )
    CreditAmount = models.DecimalField(
        max_digits=10, decimal_places=2, null=False, blank=False
    )

class Transactions(models.Model):
    TransactionType_FK = models.ForeignKey(
        "TransactionType", on_delete=models.CASCADE, null=False, blank=False, default=1
    )
    TRTemplate_FK = models.ForeignKey(
        "TRTemplate", on_delete=models.CASCADE, null=False, blank=False, default=1
    )
    TransactionNo = models.CharField(max_length=100, null=False, blank=False)
    TransactionStatus = models.CharField(max_length=50, null=False, blank=False)
    Discount_FK = models.ForeignKey(
        "Discounts", on_delete=models.SET_NULL, null=True, blank=True
    )
    Payment_FK = models.ForeignKey(
        "Payments", on_delete=models.SET_NULL, null=True, blank=True
    )
    Particulars = models.TextField(null=False, blank=False)
    Created_By = models.CharField(max_length=100, null=False, blank=False)
    Reviewed_By = models.CharField(max_length=100, null=True, blank=True)
    Date_Reviewed = models.DateField(null=True, blank=True)
    Date_Cancelled = models.DateField(null=True, blank=True)
    TransactionDate = models.DateField(null=False, blank=False)


class Discounts(models.Model):
    DiscountCode = models.CharField(max_length=50, null=False, blank=False)
    DiscountDesc = models.TextField(null=False, blank=False)
    DiscountType = models.CharField(max_length=50, null=False, blank=False)
    DiscountValue = models.DecimalField(
        max_digits=5, decimal_places=2, null=False, blank=False
    )
    StartDate = models.DateField(null=False, blank=False)
    EndDate = models.DateField(null=False, blank=False)


class Payments(models.Model):
    Gateway = models.ForeignKey(
        "PaymentGateway", on_delete=models.CASCADE, null=False, blank=False, default=None
    )
    PaymentAmount = models.DecimalField(
        max_digits=10, decimal_places=2, null=False, blank=False
    )
    PaymentType = models.CharField(max_length=50, null=False, blank=False)
    PaymentDate = models.DateField(null=False, blank=False)


class PaymentGateway(models.Model):
    GatewayName = models.CharField(max_length=100, null=False, blank=False)
    GatewayDetails = models.TextField(null=False, blank=False)
    Created_At = models.DateField(auto_now_add=True, null=False, blank=False)
