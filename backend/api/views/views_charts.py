from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView, ListCreateAPIView
from rest_framework.permissions import AllowAny
from django.shortcuts import render, get_object_or_404
from rest_framework import status
from ..models import AccountType, ChartOfAccs
from ..serializers import AccountTypeSerializer, ChartOfAccsSerializer

# Get Account Types (Rendering View of Chart of Accounts)
class AccountTypeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        account_types = AccountType.objects.all().values('id', 'AccountName')  # Fetch only necessary fields
        serializer = AccountTypeSerializer(account_types, many=True)
        return JsonResponse(serializer.data, safe=False)

# Chart of Accounts - List and Create
class ChartOfAccountsView(ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = ChartOfAccs.objects.all()
    serializer_class = ChartOfAccsSerializer

    def get(self, request, *args, **kwargs):
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return JsonResponse(serializer.data, safe=False)
        return render(request, 'chartofacc.html', {'ChartOfAccounts': self.get_serializer(self.get_queryset(), many=True).data})

# Chart of Accounts - Retrieve, Update (PUT), Partial Update (PATCH)
class ChartOfAccountDetailView(RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    queryset = ChartOfAccs.objects.all()
    serializer_class = ChartOfAccsSerializer

    def get_object(self):
        return get_object_or_404(ChartOfAccs, pk=self.kwargs['pk'])