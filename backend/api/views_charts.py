from django.http import JsonResponse
from .models import ChartOfAccs
import json

# Helper function to extract and validate data
def get_chart_of_accounts_data(request, require_all_fields = False):
    try:
        data = json.loads(request.body)
        account_data = {
            'account_code': data.get('accountCode'),
            'account_desc': data.get('accountDesc'),
            'nature_flag': data.get('natureFlag'),
            'account_type': data.get('accountType'),
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
        chartofaccs.account_code = account_data['account_code']
        chartofaccs.account_desc = account_data['account_desc']
        chartofaccs.nature_flag = account_data['nature_flag']
        chartofaccs.account_type = account_data['account_type']
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
        if account_data['account_code']:
            chartofaccs.account_code = account_data['account_code']
        if account_data['account_desc']:
            chartofaccs.account_desc = account_data['account_desc']
        if account_data['nature_flag']:
            chartofaccs.nature_flag = account_data['nature_flag']
        if account_data['account_type']:
            chartofaccs.account_type = account_data['account_type']

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
            account_code = account_data['account_code'],
            account_desc = account_data['account_desc'],
            nature_flag = account_data['nature_flag'],
            account_type = account_data['account_type']
        )
        chartofaccs.save()
        return JsonResponse({'status': 'success', 'data': {'id': chartofaccs.id}})
    
    except Exception as e:
        return JsonResponse({'status': 'error', 'errors': str(e)}, status=400)
