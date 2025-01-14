from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework import status, views
from ..models import EntryStatus
from ..serializers import EntryStatusSerializer
from rest_framework.permissions import AllowAny


class EntryStatusListView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        entry_statuses = EntryStatus.objects.all()
        serializer = EntryStatusSerializer(entry_statuses, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = EntryStatusSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EntryStatusDetailView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, pk):
        entry_status = get_object_or_404(EntryStatus, pk=pk)
        serializer = EntryStatusSerializer(entry_status)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    def put(self, request, pk):
        entry_status = get_object_or_404(EntryStatus, pk=pk)
        serializer = EntryStatusSerializer(entry_status, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        entry_status = get_object_or_404(EntryStatus, pk=pk)
        entry_status.delete()
        return JsonResponse(
            {"message": "Entry Status deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
