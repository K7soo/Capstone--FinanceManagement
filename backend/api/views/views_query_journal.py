from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework import status, views
from ..models import *
from ..serializers import *
from rest_framework.permissions import AllowAny


# Journal Entry View
class JournalQueryView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Check if this is an AJAX request
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            # Retrieve only approved journal entries
            journal_entries = JournalEntry.objects.filter(EntryStatus_FK=2)  # Approved entries only
            response_data = []

            # Include related JournalEntryDetails for each JournalEntry
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

        # Render template if not an AJAX request
        journal_entries = JournalEntry.objects.filter(EntryStatus_FK=2)  # Approved entries only
        serializer = JournalEntrySerializer(journal_entries, many=True)
        return render(request, "Reports/general_journal.html", {"journal_entries": serializer.data})
