from django.contrib import admin
from .models import (
    TRTemplateDetails, 
    TransactionDetails, 
    Transactions, 
    TRTemplate, 
    TransactionType, 
    ChartOfAccs, 
    AccountType, 
    Discounts, 
    Payments, 
    PaymentGateway
)

# Register all models with the admin site
admin.site.register(TRTemplateDetails)
admin.site.register(TransactionDetails)
admin.site.register(Transactions)
admin.site.register(TRTemplate)
admin.site.register(TransactionType)
admin.site.register(ChartOfAccs)
admin.site.register(AccountType)
admin.site.register(Discounts)
admin.site.register(Payments)
admin.site.register(PaymentGateway)

