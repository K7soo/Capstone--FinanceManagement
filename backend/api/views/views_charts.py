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
        account_types = AccountType.objects.all().values('id', 'AccountName')  # Fetch only necessary fields
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
    # Ensure that only the `id` is passed for `AccountType`
        data = request.data.copy()
        try:
            account_type = AccountType.objects.get(id=data['AccountType'])  # Validate if the AccountType exists
            data['AccountType'] = account_type.id  # Replace the object with the id
        except AccountType.DoesNotExist:
            return JsonResponse({'AccountType': ['Invalid AccountType ID provided.']}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ChartOfAccsSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)

        print("Validation Errors:", serializer.errors)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)        
            
# Chart of Accounts - Retrieve, Update (PUT), Partial Update (PATCH)
class ChartOfAccountDetailView(views.APIView):
    permission_classes = [AllowAny]
    queryset = ChartOfAccs.objects.all()
    serializer_class = ChartOfAccsSerializer

    def get_object(self):
        return get_object_or_404(ChartOfAccs, pk=self.kwargs['pk'])