from django.contrib.auth.models import User
from rest_framework import serializers
from .models import *

class PaymentRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentRecord
        fields = '__all__'

class JournalEntrySerializer(serializers.ModelSerializer):
    TransactionType_FK = serializers.PrimaryKeyRelatedField(queryset = TransactionType.objects.all())
    class Meta:
        model = JournalEntry
        fields = [
            "id",
            "TransactionType_FK",
            "TRTemplate_FK",
            "Entry_No",
            "EntryStatus_FK",
            "Entry_Date",
            "EntryParticulars",
            "Created_By",
            "Review_Remarks",
            "Adjusted_Entry",
        ]

class JournalEntryDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntryDetails
        fields = [
            "JournalEntry_FK",
            "Account_FK",
            "DebitAmount",
            "CreditAmount",
        ]

class EntryStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntryStatus
        fields = '__all__'

class TRTemplateSerializer(serializers.ModelSerializer):
    TransactionType_FK = serializers.PrimaryKeyRelatedField(queryset = TransactionType.objects.all())
    class Meta:
        model = TRTemplate
        fields = ['id', 'TRTemplateCode', 'TransactionType_FK']

class TRTemplateDetailsSerializer(serializers.ModelSerializer):
    Account_FK = serializers.PrimaryKeyRelatedField(queryset = ChartOfAccs.objects.all())
    Template_FK = serializers.PrimaryKeyRelatedField(queryset = TRTemplate.objects.all())
    class Meta:
        model = TRTemplateDetails
        fields = ['id', 'Template_FK', 'Account_FK', 'Debit', 'Credit']

class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = [
            "id",
            "TransactionTypeName",
            "TransactionCode",
            "TransactionTypeDesc",
        ]

class ChartOfAccsSerializer(serializers.ModelSerializer):
    AccountType_FK = serializers.PrimaryKeyRelatedField(queryset = AccountType.objects.all())
    class Meta:
        model = ChartOfAccs
        fields = [
            "id",               # <-- Primary Key of COA
            "AccountType_FK",   # <-- Foreign Key pointed at AccountType Table
            "AccountCode",
            "AccountDesc",
        ]

    def validate_NatureFlag(self, value):
        if not isinstance(value, bool):
            raise serializers.ValidationError("NatureFlag must be a valid boolean.")
        return value

    def validate_AccountType(self, value):
        if not AccountType.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Invalid AccountType. Must be an existing ID.")
        return value

# Account Serializer
class AccountTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountType
        fields = [
            "id",
            "AccountCode",
            "AccountTypeDesc",
        ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", 
            "username", 
            "password"
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

