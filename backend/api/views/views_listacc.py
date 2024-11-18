from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from ..models import AccountType
from ..serializers import AccountTypeSerializer


# Class-based View for List of Accounts
class ListOfAccountsView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            accounts = AccountType.objects.all()
            serializer = AccountTypeSerializer(accounts, many=True)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

        accounts = AccountType.objects.all()
        serializer = AccountTypeSerializer(accounts, many=True)
        return render(request, 'listofacc.html', {'Accounts': serializer.data})

    def post(self, request):
        serializer = AccountTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Class-based View for CRUD Operations on Individual Accounts
class ListOfAccountsChangeView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk=None):
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            accounts = AccountType.objects.all()
            serializer = AccountTypeSerializer(accounts, many=True)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    def delete(self, request, pk=None):
        try:
            account = AccountType.objects.get(pk=pk)
            account.delete()
            return Response({'message': 'Account deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except AccountType.DoesNotExist:
            return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk=None):
        try:
            account = AccountType.objects.get(pk=pk)
            serializer = AccountTypeSerializer(account, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except AccountType.DoesNotExist:
            return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)
