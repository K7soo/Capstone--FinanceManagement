from django.http import JsonResponse
from .models import ChartOfAccs
import json

# Helper function to extract and validate data
def get_chart_of_accounts_data(request, require_all_fields = False):
    try:
        data = json.loads(request.body)
        account_data = {
            'AccountCode': data.get('AccountCode'),
            'AccountDesc': data.get('AccountDesc'),
            'NatureFlag': data.get('NatureFlag'),
            'AccountType': data.get('AccountType'),
        }

        if require_all_fields and not all(account_data.values()):
            return None, JsonResponse({'status': 'error', 'message': 'All fields must be provided for full update'}, status=400)
        return account_data, None
    
    except json.JSONDecodeError:
        return None, JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)


# PUT
def update_chart_of_accounts(request):
    account_data, error_response = get_chart_of_accounts_data(request, require_all_fields=True)
    if error_response:
        return error_response

    account_id = json.loads(request.body).get('id')
    if not account_id:
        return JsonResponse({'status': 'error', 'message': 'ID must be provided for full update'}, status=400)

    try:
        chartofaccs = ChartOfAccs.objects.get(id=account_id)
        chartofaccs.AccountCode = account_data['AccountCode']
        chartofaccs.AccountDesc = account_data['AccountDesc']
        chartofaccs.NatureFlag = account_data['NatureFlag']
        chartofaccs.AccountType = account_data['AccountType']
        chartofaccs.save()
        return JsonResponse({'status': 'success', 'data': {'id': chartofaccs.id}})

    except ChartOfAccs.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Account not found'}, status=404)

# PATCH
def patch_chart_of_accounts(request):
    account_data, error_response = get_chart_of_accounts_data(request)
    if error_response:
        return error_response

    account_id = json.loads(request.body).get('id')
    if not account_id:
        return JsonResponse({'status': 'error', 'message': 'ID must be provided for partial update'}, status=400)

    try:
        chartofaccs = ChartOfAccs.objects.get(id=account_id)

        # Only update fields that are present
        if account_data['AccountCode']:
            chartofaccs.account_code = account_data['AccountCode']
        if account_data['AccountDesc']:
            chartofaccs.account_desc = account_data['AccountDesc']
        if account_data['NatureFlag']:
            chartofaccs.nature_flag = account_data['NatureFlag']
        if account_data['AccountType']:
            chartofaccs.account_type = account_data['AccountType']

        chartofaccs.save()
        return JsonResponse({'status': 'success', 'data': {'id': chartofaccs.id}})
    
    except ChartOfAccs.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Account not found'}, status=404)

# POST
def create_chart_of_accounts(request):
    account_data, error_response = get_chart_of_accounts_data(request)
    if error_response:
        return error_response

    try:
        chartofaccs = ChartOfAccs.objects.create(
            AccountCode = account_data['AccountCode'],
            AccountDesc = account_data['AccountDesc'],
            NatureFlag = account_data['NatureFlag'],
            AccountType = account_data['AccountType']
        )
        return chartofaccs, None, JsonResponse({'status': 'success', 'data': {'id': chartofaccs.id}})
    
    # except Exception as e:
    #     return JsonResponse({'status': 'error', 'errors': str(e)}, status=400)
    except Exception as e:
        error_response = JsonResponse({'status': 'error', 'errors': str(e)}, status=400)
        return None, error_response
