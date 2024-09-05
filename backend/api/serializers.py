from django.contrib.auth.models import User
from rest_framework import serializers
from .models import TRTemplate, TRTemplateDetails, TransactionDetails, Transactions, TransactionType, ChartOfAccs, AccountType, Discounts, PaymentGateway, Payments

class TRTemplateDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TRTemplateDetails
        fields = '__all__'

class TransactionDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionDetails
        fields = '__all__'

class TransactionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transactions
        fields = '__all__'

class TRTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TRTemplate
        fields = '__all__'

class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = '__all__'

class ChartOfAccsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartOfAccs
        fields = '__all__'

class AccountTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountType
        fields = '__all__'

class DiscountsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discounts
        fields = '__all__'

class PaymentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payments
        fields = '__all__'

class PaymentGatewaySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentGateway
        fields = '__all__'

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

