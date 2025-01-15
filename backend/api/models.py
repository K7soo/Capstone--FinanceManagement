from django.db import models
from django.contrib.auth.models import User


class TRTemplate(models.Model):
    TRTemplateCode = models.CharField(max_length=50)
    TransactionType_FK = models.ForeignKey(
        'TransactionType', on_delete=models.CASCADE, null=True, blank=False
    )

class TRTemplateDetails(models.Model):
    Template_FK = models.ForeignKey(
        'TRTemplate', on_delete=models.CASCADE, null=True, blank=True
    ) 
    Account_FK = models.ForeignKey(
        'ChartOfAccs', on_delete=models.CASCADE, null=False, blank=False
    )
    Debit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    Credit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)


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


class JournalEntry(models.Model):
    TransactionType_FK = models.ForeignKey(
        "TransactionType", on_delete=models.CASCADE, null=False, blank=False, default=1
    )
    TRTemplate_FK = models.ForeignKey(
        "TRTemplate", on_delete=models.CASCADE, null=False, blank=False, default=1
    )
    Entry_No = models.CharField(max_length=100, null=False, blank=False)

    # Entry_Status
    EntryStatus_FK = models.ForeignKey(
        "EntryStatus", on_delete=models.CASCADE, null=True, blank=True, default=1
    )

    Entry_Date = models.DateField(null=False, blank=False)
    EntryParticulars = models.TextField(null=False, blank=False)

    Created_By = models.CharField(max_length=100, null=True, blank=True)
    Reviewed_By = models.CharField(max_length=100, null=True, blank=True)
    Review_Remarks = models.CharField(max_length=100, null=True, blank=True)
    Date_Reviewed = models.DateField(null=True, blank=True)
    Date_Cancelled = models.DateField(null=True, blank=True)


class JournalEntryDetails(models.Model):
    JournalEntry_FK = models.ForeignKey(
        "JournalEntry", on_delete=models.CASCADE, null=False, blank=False
    )
    Account_FK = models.ForeignKey(
        "ChartOfAccs", on_delete=models.CASCADE, null=False, blank=False
    )
    DebitAmount = models.DecimalField(
        max_digits=10, decimal_places=2, null=False, blank=False, default=0.00
    )
    CreditAmount = models.DecimalField(
        max_digits=10, decimal_places=2, null=False, blank=False, default=0.00
    )

class EntryStatus(models.Model):
    Status_Name = models.TextField(null=False, blank=False)
