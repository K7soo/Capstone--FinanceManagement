from django.contrib import admin
from .models import (
    TRTemplateDetails, 
    TRTemplate, 
    TransactionType, 
    ChartOfAccs, 
    AccountType,
    JournalEntry,
    JournalEntryDetails,
    EntryStatus,
)

# Register all models with the admin site
admin.site.register(TRTemplateDetails)
admin.site.register(JournalEntry)
admin.site.register(JournalEntryDetails)
admin.site.register(EntryStatus)
admin.site.register(TRTemplate)
admin.site.register(TransactionType)
admin.site.register(ChartOfAccs)
admin.site.register(AccountType)

