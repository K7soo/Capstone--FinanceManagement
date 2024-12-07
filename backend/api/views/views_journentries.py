from django.shortcuts import render, get_object_or_404
# from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, views
from ..models import TRTemplate, TRTemplateDetails, ChartOfAccs, TransactionType
from ..serializers import TRTemplateSerializer, TRTemplateDetailsSerializer, ChartOfAccsSerializer, TransactionTypeSerializer
from django.http import JsonResponse

class JournalEntryView(views.APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        pass
    def post(self, request):
        pass

class JournalEntryDetailView(views.APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        pass
    def put(self, request):
        pass
    def delete(self, request):
        pass