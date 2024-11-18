from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListCreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..models import TRTemplate, ChartOfAccs
from ..serializers import TRTemplateSerializer, ChartOfAccsSerializer
from django.http import JsonResponse

queryset = TRTemplate.objects.all()
serializer_class = TRTemplateSerializer

class ChartOfAccsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        charts = ChartOfAccs.objects.all().values('id', 'AccountCode')  # Fetch only necessary fields
        serializer = ChartOfAccsSerializer(charts, many=True)
        return JsonResponse(serializer.data, safe=False)

# List and Create Journal Templates
class JournalTemplatesView(ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = TRTemplate.objects.all()
    serializer_class = TRTemplateSerializer

    def get(self, request, *args, **kwargs):
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            queryset = self.get_queryset
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, safe=False)
        return render(request, 'journaltemp.html', {'JournalTemplate': self.get_serializer(self.get_queryset(), many=True).data})
    
# Retrieve, Update, Delete Journal Template
class JournalTemplatesDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = TRTemplate.objects.all()
    serializer_class = TRTemplateSerializer

    def get_object(self):
        return get_object_or_404(TRTemplate, pk=self.kwargs['pk'])