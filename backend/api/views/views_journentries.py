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
        # Check if this is an AJAX request
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            journal_entries = JournalEntry.objects.all()
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
        journal_entries = JournalEntry.objects.all()
        serializer = JournalEntrySerializer(journal_entries, many=True)
        return render(request, "Transaction/journalentries.html", {"journal_entries": serializer.data})
    
    def post(self, request):
        data = request.data
        journal_entry_data = data.get("journal_entry")
        journal_details_data = data.get("journal_details", [])

        if not journal_entry_data or not journal_details_data:
            return JsonResponse(
                {"error": "Journal entry and details are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate and save the JournalEntry
        journal_entry_serializer = JournalEntrySerializer(data=journal_entry_data)
        if not journal_entry_serializer.is_valid():
            return JsonResponse(
                journal_entry_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        journal_entry = journal_entry_serializer.save()

        # Validate and save the JournalEntryDetails
        for detail in journal_details_data:
            detail["JournalEntry_FK"] = journal_entry.id  # Set the foreign key
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


class JournalRetrieveView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, pk):
        journal_entry = get_object_or_404(JournalEntry, pk=pk)
        journal_details = JournalEntryDetails.objects.filter(JournalEntry_FK=journal_entry.id)

        journal_entry_serializer = JournalEntrySerializer(journal_entry)
        journal_details_serializer = JournalEntryDetailsSerializer(journal_details, many=True)

        response_data = {
            "journal_entry": journal_entry_serializer.data,
            "journal_details": journal_details_serializer.data,
        }
        return JsonResponse(response_data, safe=False, status=status.HTTP_200_OK)
    
    def patch(self, request, pk):
        try:
            # Retrieve the journal entry by its primary key
            journal_entry = get_object_or_404(JournalEntry, pk=pk)
        except JournalEntry.DoesNotExist:
            return JsonResponse(
                {"error": "JournalEntry not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Update only the fields provided in the payload
        journal_entry_data = request.data
        if journal_entry_data:
            serializer = JournalEntrySerializer(
                journal_entry, data=journal_entry_data, partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(
                    {"message": "JournalEntry updated successfully"},
                    status=status.HTTP_200_OK
                )
            else:
                return JsonResponse(
                    serializer.errors, status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return JsonResponse(
                {"error": "No data provided for update"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def put(self, request, pk):
        # Fetch the journal entry by primary key
        journal_entry = get_object_or_404(JournalEntry, pk=pk)

        # Extract the payload for journal entry and details
        journal_entry_data = request.data.get("journal_entry")
        journal_details_data = request.data.get("journal_details", [])

        if not journal_entry_data or not journal_details_data:
            return JsonResponse(
                {"error": "Journal entry and details are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update the journal entry
        journal_entry_serializer = JournalEntrySerializer(
            journal_entry, data=journal_entry_data, partial=True
        )
        if not journal_entry_serializer.is_valid():
            return JsonResponse(
                journal_entry_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        journal_entry_serializer.save()

        # Handle journal entry details
        existing_details = JournalEntryDetails.objects.filter(JournalEntry_FK=journal_entry.id)
        existing_detail_ids = set(existing_details.values_list("id", flat=True))
        incoming_detail_ids = set(
            [detail.get("id") for detail in journal_details_data if detail.get("id") is not None]
        )

        # Delete removed details
        details_to_delete = existing_detail_ids - incoming_detail_ids
        JournalEntryDetails.objects.filter(id__in=details_to_delete).delete()

        # Update existing or create new details
        for detail_data in journal_details_data:
            detail_id = detail_data.get("id")
            if detail_id and detail_id in existing_detail_ids:
                # Update existing detail
                detail_instance = JournalEntryDetails.objects.get(id=detail_id)
                detail_serializer = JournalEntryDetailsSerializer(
                    detail_instance, data=detail_data, partial=True
                )
                if not detail_serializer.is_valid():
                    return JsonResponse(
                        detail_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )
                detail_serializer.save()
            else:
                # Create new detail
                detail_data["JournalEntry_FK"] = journal_entry.id
                detail_serializer = JournalEntryDetailsSerializer(data=detail_data)
                if not detail_serializer.is_valid():
                    return JsonResponse(
                        detail_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )
                detail_serializer.save()

        return JsonResponse(
            {"message": "JournalEntry and details updated successfully."},
            status=status.HTTP_200_OK,
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

    def put(self, request, pk=None):
        if pk is None:
            return JsonResponse({"error": "JournalEntry ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        journal_entry_data = request.data.get("journal_entry")
        journal_details_data = request.data.get("journal_details")

        if not journal_entry_data or not journal_details_data:
            return JsonResponse({"error": "Invalid data payload"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the existing journal entry
            journal_entry = JournalEntry.objects.get(pk=pk)
        except JournalEntry.DoesNotExist:
            return JsonResponse({"error": "JournalEntry not found"}, status=status.HTTP_404_NOT_FOUND)

        # Update the journal entry
        journal_entry_serializer = JournalEntrySerializer(journal_entry, data=journal_entry_data)
        if not journal_entry_serializer.is_valid():
            return JsonResponse(journal_entry_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        journal_entry_serializer.save()

        # Handle journal details
        existing_detail_ids = set(JournalEntryDetails.objects.filter(JournalEntry_FK=pk).values_list("id", flat=True))
        incoming_detail_ids = set(
            [detail.get("id") for detail in journal_details_data if detail.get("id") is not None]
        )

        # Delete details that are not in the incoming payload
        details_to_delete = existing_detail_ids - incoming_detail_ids
        JournalEntryDetails.objects.filter(id__in=details_to_delete).delete()

        # Update or create details
        for detail_data in journal_details_data:
            detail_id = detail_data.get("id")

            if detail_id and detail_id in existing_detail_ids:
                # Update existing detail
                detail_instance = JournalEntryDetails.objects.get(pk=detail_id)
                detail_serializer = JournalEntryDetailsSerializer(detail_instance, data=detail_data)
                if not detail_serializer.is_valid():
                    return JsonResponse(detail_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                detail_serializer.save()
            else:
                # Create new detail
                detail_data["JournalEntry_FK"] = pk  # Associate new detail with the current journal entry
                detail_serializer = JournalEntryDetailsSerializer(data=detail_data)
                if not detail_serializer.is_valid():
                    return JsonResponse(detail_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                detail_serializer.save()

        return JsonResponse({"message": "JournalEntry and details updated successfully"}, status=status.HTTP_200_OK)


    def delete(self, request, pk):
        journal_entry = get_object_or_404(JournalEntry, pk=pk)
        journal_entry.delete()
        return JsonResponse(
            {"message": "Journal Entry deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )

