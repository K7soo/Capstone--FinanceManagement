from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
from ..models import *
from ..serializers import *
from rest_framework.permissions import AllowAny

class JournalQueryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        transaction_type = request.GET.get('transaction_type', None)
        as_of_date = request.GET.get('as_of', None)
        duration_from = request.GET.get('duration_from', None)
        duration_to = request.GET.get('duration_to', None)

        # Filter only for Approved entries
        journal_entries = JournalEntry.objects.filter(EntryStatus_FK=2)

        # Apply transaction type filter if not "All"
        if transaction_type and transaction_type != 'all':
            journal_entries = journal_entries.filter(TransactionType_FK=transaction_type)

        # Apply date filters
        if as_of_date:
            journal_entries = journal_entries.filter(Entry_Date__lte=as_of_date)
        if duration_from and duration_to:
            journal_entries = journal_entries.filter(Entry_Date__range=[duration_from, duration_to])

        # Serialize data
        response_data = []
        for journal_entry in journal_entries:
            journal_entry_serializer = JournalEntrySerializer(journal_entry)
            journal_details = JournalEntryDetails.objects.filter(
                JournalEntry_FK=journal_entry.id
            )
            journal_details_serializer = JournalEntryDetailsSerializer(
                journal_details, many=True
            )
            response_data.append({
                "journal_entry": journal_entry_serializer.data,
                "journal_details": journal_details_serializer.data,
            })

        return JsonResponse(response_data, safe=False, status=status.HTTP_200_OK)


class LedgerQueryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        charted_account = request.GET.get('charted_account', None)  # Selected Chart of Accounts
        as_of_date = request.GET.get('as_of', None)
        duration_from = request.GET.get('duration_from', None)
        duration_to = request.GET.get('duration_to', None)

        ledger_entries = JournalEntryDetails.objects.select_related('JournalEntry_FK').all()

        # Filter by account
        if charted_account and charted_account != 'all':
            ledger_entries = ledger_entries.filter(Account_FK=charted_account)

        # Apply date filters
        if as_of_date:
            ledger_entries = ledger_entries.filter(JournalEntry_FK__Entry_Date__lte=as_of_date)
        if duration_from and duration_to:
            ledger_entries = ledger_entries.filter(JournalEntry_FK__Entry_Date__range=[duration_from, duration_to])

        response_data = []
        for entry in ledger_entries:
            journal_entry_serializer = JournalEntrySerializer(entry.JournalEntry_FK)
            journal_details_serializer = JournalEntryDetailsSerializer(entry)

            response_data.append({
                "journal_entry": journal_entry_serializer.data,
                "journal_details": journal_details_serializer.data
            })

        return JsonResponse(response_data, safe=False, status=status.HTTP_200_OK)