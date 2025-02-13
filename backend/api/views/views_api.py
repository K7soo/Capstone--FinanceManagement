import requests
from django.shortcuts import render, get_object_or_404
from calendar import monthrange
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status, views
from rest_framework.permissions import AllowAny
from ..serializers import *
from ..models import *
from django.db.models import Sum, F, ExpressionWrapper, DecimalField
from datetime import datetime, timedelta


class PaymentRecordRetrieveView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            # Return JSON response for AJAX requests
            records = PaymentRecord.objects.filter(EntryCreated=0)
            serializer = PaymentRecordSerializer(records, many=True)
            return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

        # Return rendered HTML for non-AJAX requests
        records = PaymentRecord.objects.all()
        serializer = PaymentRecordSerializer(records, many=True)
        return render(request, "Transaction/trinbox.html", {"PaymentRecord": serializer.data})
    
    def patch(self, request, pk):
        payment_record = get_object_or_404(PaymentRecord, pk=pk)
        serializer = PaymentRecordSerializer(payment_record, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_200_OK)

        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        try:
            # Delete all payment records
            deleted_count, _ = PaymentRecord.objects.all().delete()
            return Response(
                {"message": f"All payment records deleted successfully. Total deleted: {deleted_count}"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class PaymentRecordView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        # Retrieve all payment records or filter by query parameters if provided
        transaction_id = request.query_params.get('transaction_id', None)
        if transaction_id:
            records = PaymentRecord.objects.filter(transaction_id=transaction_id)
        else:
            records = PaymentRecord.objects.all()
        
        serializer = PaymentRecordSerializer(records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = PaymentRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Payment record saved successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        transaction_id = request.query_params.get('transaction_id')
        if not transaction_id:
            return Response({"error": "Transaction ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            payment_record = PaymentRecord.objects.get(transaction_id=transaction_id)
            payment_record.delete()
            return Response({"message": "Payment record deleted successfully"}, status=status.HTTP_200_OK)
        except PaymentRecord.DoesNotExist:
            return Response({"error": "Payment record not found"}, status=status.HTTP_404_NOT_FOUND)
        

class COGSTotalWithSources(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Get the specific "Cost of Goods Sold" account
            cogs_account = ChartOfAccs.objects.filter(AccountDesc__iexact="Cost of Goods Sold").first()

            # If account does not exist, return an empty response
            if not cogs_account:
                return JsonResponse({"message": "Cost of Goods Sold account not found."}, status=status.HTTP_204_NO_CONTENT)

            # Retrieve approved journal entries for "Cost of Goods Sold"
            journal_details = JournalEntryDetails.objects.filter(
                Account_FK=cogs_account,
                JournalEntry_FK__EntryStatus_FK=2  # Only Approved Entries
            )

            # Calculate total COGS (default to 0 if no values)
            total_cogs = journal_details.aggregate(
                total=Sum(F('DebitAmount') - F('CreditAmount'), output_field=DecimalField())
            )['total'] or 0

            # Retrieve sources contributing to COGS
            account_sources = journal_details.values(
                'Account_FK__AccountCode',
                'Account_FK__AccountDesc'
            ).annotate(
                total_debit=Sum('DebitAmount'),
                total_credit=Sum('CreditAmount'),
                net_expense=Sum(F('DebitAmount') - F('CreditAmount'))
            ).order_by('Account_FK__AccountCode')  # Sort by Account Code

            # If no data is found, return an empty response
            if not account_sources and total_cogs == 0:
                return JsonResponse({"message": "No Cost of Goods Sold data found."}, status=status.HTTP_204_NO_CONTENT)

            # Structure the response
            response_data = {
                "total_cogs": total_cogs,
                "account_sources": list(account_sources)
            }

            return JsonResponse(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ProductInventoryTotalWithSources(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Get the specific "Product Inventory" account
            inventory_account = ChartOfAccs.objects.filter(AccountDesc__iexact="Products Inventory").first()

            # If account does not exist, return an empty response
            if not inventory_account:
                return JsonResponse({"message": "Product Inventory account not found."}, status=status.HTTP_204_NO_CONTENT)

            # Retrieve approved journal entries for "Product Inventory"
            journal_details = JournalEntryDetails.objects.filter(
                Account_FK=inventory_account,
                JournalEntry_FK__EntryStatus_FK=2  # Only Approved Entries
            )

            # Calculate total purchase cost of inventory (default to 0 if no values)
            total_inventory_purchase = journal_details.aggregate(
                total=Sum(F('DebitAmount') - F('CreditAmount'), output_field=DecimalField())
            )['total'] or 0

            # Retrieve sources contributing to Product Inventory
            account_sources = journal_details.values(
                'Account_FK__AccountCode',
                'Account_FK__AccountDesc'
            ).annotate(
                total_debit=Sum('DebitAmount'),
                total_credit=Sum('CreditAmount'),
                net_inventory_cost=Sum(F('DebitAmount') - F('CreditAmount'))
            ).order_by('Account_FK__AccountCode')  # Sort by Account Code

            # If no data is found, return an empty response
            if not account_sources and total_inventory_purchase == 0:
                return JsonResponse({"message": "No Product Inventory data found."}, status=status.HTTP_204_NO_CONTENT)

            # Structure the response
            response_data = {
                "total_inventory_purchase": total_inventory_purchase,
                "account_sources": list(account_sources)
            }

            return JsonResponse(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class ExpenseTotalWithSources(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Filter for 'Expense' Account Type
            expense_accounts = ChartOfAccs.objects.filter(AccountType_FK__AccountTypeDesc='Expenses')

            # Filter JournalEntryDetails for:
            # 1. Accounts under 'Expense'
            # 2. Only Approved Journal Entries (EntryStatus_FK=2)
            journal_details = JournalEntryDetails.objects.filter(
                Account_FK__in=expense_accounts,
                JournalEntry_FK__EntryStatus_FK=2  # Approved entries only
            )

            # Calculate total: Debit - Credit
            total_expense = journal_details.aggregate(
                total=Sum(ExpressionWrapper(F('DebitAmount') - F('CreditAmount'), output_field=DecimalField()))
            )['total'] or 0  # Default to 0 if no data

            # Prepare detailed account information
            account_sources = journal_details.values(
                'Account_FK__AccountCode',
                'Account_FK__AccountDesc'
            ).annotate(
                total_debit=Sum('DebitAmount'),
                total_credit=Sum('CreditAmount'),
                net_expense=ExpressionWrapper(F('DebitAmount') - F('CreditAmount'), output_field=DecimalField())
            )

            # Structure the response
            response_data = {
                "total_expense": total_expense,
                "account_sources": list(account_sources)
            }

            return JsonResponse(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class IncomeTotalWithSources(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            # Filter for 'Income' Account Type
            income_accounts = ChartOfAccs.objects.filter(AccountType_FK__AccountTypeDesc='Income')

            # Filter JournalEntryDetails for:
            # 1. Accounts under 'Income'
            # 2. Only Approved Journal Entries (assuming EntryStatus_FK=2 means 'Approved')
            journal_details = JournalEntryDetails.objects.filter(
                Account_FK__in=income_accounts,
                JournalEntry_FK__EntryStatus_FK=2  # Filter for Approved status
            )

            # Calculate total: Credit - Debit
            total_amount = journal_details.aggregate(
                total=Sum(ExpressionWrapper(F('CreditAmount') - F('DebitAmount'), output_field=DecimalField()))
            )['total'] or 0  # Default to 0 if no data

            # Prepare detailed account information
            account_sources = journal_details.values(
                'Account_FK__AccountCode', 
                'Account_FK__AccountDesc'
            ).annotate(
                total_credit=Sum('CreditAmount'),
                total_debit=Sum('DebitAmount'),
                net_amount=ExpressionWrapper(F('CreditAmount') - F('DebitAmount'), output_field=DecimalField())
            )

            # Structure the response
            response_data = {
                "total_income": total_amount,
                "account_sources": list(account_sources)
            }

            return JsonResponse(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class IncomeTotalQueryView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            # Get year and month from query parameters
            year = int(request.GET.get('year', datetime.now().year))
            month = int(request.GET.get('month', datetime.now().month))

            # Get the number of days in the month
            num_days = monthrange(year, month)[1]

            # Filter for 'Income' accounts
            income_accounts = ChartOfAccs.objects.filter(AccountType_FK__AccountTypeDesc='Income')

            # Base query for journal details with 'Approved' status
            journal_details = JournalEntryDetails.objects.filter(
                Account_FK__in=income_accounts,
                JournalEntry_FK__EntryStatus_FK=2,  # Approved entries
                JournalEntry_FK__Entry_Date__year=year,
                JournalEntry_FK__Entry_Date__month=month
            )

            # Function to get week range for a given date
            def get_week_range(date):
                start_of_week = date - timedelta(days=date.weekday())
                end_of_week = start_of_week + timedelta(days=6)
                return start_of_week, end_of_week

            # Generate weeks for the entire month
            weeks_data = {}
            current_date = datetime(year, month, 1)

            while current_date.day <= num_days:
                week_start, week_end = get_week_range(current_date)

                # Ensure the week is within the month
                if week_start.month != month:
                    week_start = datetime(year, month, 1)
                if week_end.month != month:
                    week_end = datetime(year, month, num_days)

                week_key = f"Week of {week_start.strftime('%b %d')} - {week_end.strftime('%b %d')}"

                # Initialize the week if not already present
                if week_key not in weeks_data:
                    weeks_data[week_key] = {
                        "total_credit": 0,
                        "total_debit": 0,
                        "net_income": 0,
                        "accounts": []
                    }

                # Filter journal entries for the current week
                weekly_entries = journal_details.filter(
                    JournalEntry_FK__Entry_Date__range=[week_start, week_end]
                )

                for detail in weekly_entries:
                    weeks_data[week_key]["total_credit"] += detail.CreditAmount or 0
                    weeks_data[week_key]["total_debit"] += detail.DebitAmount or 0
                    weeks_data[week_key]["net_income"] = (
                        weeks_data[week_key]["total_credit"] - weeks_data[week_key]["total_debit"]
                    )

                    # Add account info if not already present
                    account_info = {
                        "AccountCode": detail.Account_FK.AccountCode,
                        "AccountDesc": detail.Account_FK.AccountDesc,
                        "CreditAmount": detail.CreditAmount,
                        "DebitAmount": detail.DebitAmount
                    }

                    if account_info not in weeks_data[week_key]["accounts"]:
                        weeks_data[week_key]["accounts"].append(account_info)

                # Move to the next week
                current_date = week_end + timedelta(days=1)

            return JsonResponse({"weekly_income": weeks_data}, status=status.HTTP_200_OK)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

