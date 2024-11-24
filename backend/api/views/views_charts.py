from django.http import JsonResponse
from rest_framework import status, views
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import render, get_object_or_404
from ..models import AccountType, ChartOfAccs
from ..serializers import AccountTypeSerializer, ChartOfAccsSerializer

# Get Account Types (Rendering View of Chart of Accounts)
class AccountTypeListView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        account_types = AccountType.objects.all()  
        serializer = AccountTypeSerializer(account_types, many=True)
        return JsonResponse(serializer.data, safe=False)

# Chart of Accounts - List and Create
class ChartOfAccountsView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            chart_of_accs = ChartOfAccs.objects.all()
            serializer = ChartOfAccsSerializer(chart_of_accs, many=True)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
        
        chart_of_accs = ChartOfAccs.objects.all()
        serializer = ChartOfAccsSerializer(chart_of_accs, many=True)
        return render(request, 'chartofacc.html', {'ChartOfAccounts': serializer.data})

    def post(self, request):
        # try:
        #     data['AccountType_FK'] = int(data['AccountType'])
        # except ValueError:
        #     return JsonResponse({'error': 'AccountType must be a valid integer.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ChartOfAccsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)       
            
# Chart of Accounts - Retrieve, Update (PUT), Partial Update (PATCH)
class ChartOfAccountDetailView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, pk=None):
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            chart_of_accs = ChartOfAccs.objects.all()
            serializer = ChartOfAccsSerializer(chart_of_accs, many=True)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
        pass

    def delete(self, request, pk=None):
        try:
            chart_of_accs = ChartOfAccs.objects.get(pk=pk)
            chart_of_accs.delete()
            return Response({'message': 'Charted Account deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except ChartOfAccs.DoesNotExist:
            return Response({'error': 'Accounts not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk=None):
        try:
            chart_of_accs = ChartOfAccs.objects.get(pk=pk)
            serializer = ChartOfAccsSerializer(chart_of_accs, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ChartOfAccs.DoesNotExist:
            return Response({'error': 'Accounts not found'}, status=status.HTTP_404_NOT_FOUND)
        