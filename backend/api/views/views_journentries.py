from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework import status, views
from ..models import *
from ..serializers import *
from rest_framework.permissions import AllowAny


# Journal Entry View
class JournalEntryView(views.APIView):
    permission_classes = [AllowAny]
     
    def get(self, request):
        journal_entries = JournalEntry.objects.all()
        serializer = JournalEntrySerializer(journal_entries, many=True)
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
        return render(request, 'Transaction/journalentries.html', {'JournalEntry': serializer.data})

    def post(self, request):
        data = request.data

        # Extract JournalEntry data
        journal_entry_data = data.get("journal_entry")
        journal_details_data = data.get("journal_details", [])

        if not journal_entry_data or not journal_details_data:
            return JsonResponse(
                {"error": "Journal entry and details are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save the JournalEntry
        journal_entry_serializer = JournalEntrySerializer(data=journal_entry_data)
        if journal_entry_serializer.is_valid():
            journal_entry = journal_entry_serializer.save()

            # Save the JournalEntryDetails
            for detail in journal_details_data:
                detail["journal_entry_fk"] = journal_entry.id
                journal_detail_serializer = JournalEntryDetailsSerializer(data=detail)
                if not journal_detail_serializer.is_valid():
                    return JsonResponse(
                        journal_detail_serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST
                    )
                journal_detail_serializer.save()

            return JsonResponse(
                journal_entry_serializer.data,
                status=status.HTTP_201_CREATED
            )
        return JsonResponse(
            journal_entry_serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class JournalEntryDetailView(views.APIView):
    permission_classes = [AllowAny]
     
    def get(self, request, pk):
        journal_entry = get_object_or_404(JournalEntry, pk=pk)
        journal_details = JournalEntryDetails.objects.filter(journal_entry_fk=journal_entry)

        journal_entry_serializer = JournalEntrySerializer(journal_entry)
        journal_details_serializer = JournalEntryDetailsSerializer(journal_details, many=True)

        return JsonResponse(
            {
                "journal_entry": journal_entry_serializer.data,
                "journal_details": journal_details_serializer.data,
            },
            safe=False,
            status=status.HTTP_200_OK
        )

    def put(self, request, pk):
        journal_entry = get_object_or_404(JournalEntry, pk=pk)
        data = request.data

        journal_entry_data = data.get("journal_entry")
        journal_details_data = data.get("journal_details", [])

        # Update the JournalEntry
        journal_entry_serializer = JournalEntrySerializer(journal_entry, data=journal_entry_data, partial=True)
        if journal_entry_serializer.is_valid():
            journal_entry_serializer.save()

            # Update JournalEntryDetails
            for detail in journal_details_data:
                detail_id = detail.get("id")
                if detail_id:
                    journal_detail = get_object_or_404(JournalEntryDetails, id=detail_id)
                    journal_detail_serializer = JournalEntryDetailsSerializer(
                        journal_detail, data=detail, partial=True
                    )
                else:
                    detail["journal_entry_fk"] = journal_entry.id
                    journal_detail_serializer = JournalEntryDetailsSerializer(data=detail)

                if not journal_detail_serializer.is_valid():
                    return JsonResponse(
                        journal_detail_serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST
                    )
                journal_detail_serializer.save()

            return JsonResponse(journal_entry_serializer.data, status=status.HTTP_200_OK)
        return JsonResponse(journal_entry_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        journal_entry = get_object_or_404(JournalEntry, pk=pk)
        journal_entry.delete()
        return JsonResponse(
            {"message": "Journal Entry deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


# Journal Entry Details View
class JournalEntryDetailsView(views.APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        journal_details = JournalEntryDetails.objects.all()
        serializer = JournalEntryDetailsSerializer(journal_details, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        serializer = JournalEntryDetailsSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        journal_detail = get_object_or_404(JournalEntryDetails, pk=pk)
        serializer = JournalEntryDetailsSerializer(journal_detail, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        journal_detail = get_object_or_404(JournalEntryDetails, pk=pk)
        journal_detail.delete()
        return JsonResponse(
            {"message": "Journal Entry Detail deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
