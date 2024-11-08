from django.http import JsonResponse
from .models import AccountType  # Import your AccountType model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

# Rendering View of Chart of Accounts
@api_view(['GET'])
@permission_classes([AllowAny])
def get_account_types(request):
    if request.method == 'GET':
        account_types = AccountType.objects.all().values('id', 'AccountName')  # Fetch only necessary fields
        account_types_list = list(account_types)  # Convert queryset to list
        return JsonResponse(account_types_list, safe=False)