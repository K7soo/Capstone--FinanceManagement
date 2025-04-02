from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
from ..models import *
from ..serializers import *
from rest_framework.permissions import AllowAny
from django.db.models import Sum, Q, Case, When, Value, F

class JournalQueryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        transaction_type = request.GET.get('transaction_type', None)
        period = request.GET.get('period', None)
        year = request.GET.get('year', None)
        month = request.GET.get('month', None)

        # Filter only for Approved entries
        journal_entries = JournalEntry.objects.filter(EntryStatus_FK=2)

        # Apply transaction type filter if not "All"
        if transaction_type and transaction_type.lower() != 'all':
            journal_entries = journal_entries.filter(TransactionType_FK=transaction_type)

        # Apply date filters based on the selected period
        if year:
            journal_entries = journal_entries.filter(Entry_Date__year=year)

            if period == "Monthly" and month:
                journal_entries = journal_entries.filter(Entry_Date__month=month)
            
            elif period == "Quarterly" and month:
                quarter_map = {
                    "1st Quarter": [1, 2, 3],
                    "2nd Quarter": [4, 5, 6],
                    "3rd Quarter": [7, 8, 9],
                    "4th Quarter": [10, 11, 12],
                }
                months = quarter_map.get(month, [])
                journal_entries = journal_entries.filter(Entry_Date__month__in=months)

            elif period == "Semi Annually" and month:
                semi_annual_map = {
                    "1st Half": [1, 2, 3, 4, 5, 6],
                    "2nd Half": [7, 8, 9, 10, 11, 12],
                }
                months = semi_annual_map.get(month, [])
                journal_entries = journal_entries.filter(Entry_Date__month__in=months)

            elif period == "Annual":
                # No additional month filter needed, just the year is enough
                pass

        # Serialize data
        response_data = []
        for journal_entry in journal_entries:
            journal_entry_serializer = JournalEntrySerializer(journal_entry)
            journal_details = JournalEntryDetails.objects.filter(
                JournalEntry_FK=journal_entry.id
            )
            journal_details_serializer = JournalEntryDetailsSerializer(
                journal_details, many=True
            )
            response_data.append({
                "journal_entry": journal_entry_serializer.data,
                "journal_details": journal_details_serializer.data,
            })

        return JsonResponse(response_data, safe=False, status=status.HTTP_200_OK)
    
    
class LedgerQueryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        charted_account = request.GET.get('charted_account', None)
        period = request.GET.get('period', None)
        year = request.GET.get('year', None)
        month = request.GET.get('month', None)

        # Filter only approved journal entries and order by ascending date
        ledger_entries = JournalEntryDetails.objects.select_related('JournalEntry_FK').filter(
            JournalEntry_FK__EntryStatus_FK=2  # Ensures only Approved entries are fetched
        ).order_by('JournalEntry_FK__Entry_Date')  # Sorts entries by ascending date

        # Filter by charted account
        if charted_account and charted_account.lower() != 'all':
            ledger_entries = ledger_entries.filter(Account_FK=charted_account)

        # Apply date filters based on the selected period
        if year:
            ledger_entries = ledger_entries.filter(JournalEntry_FK__Entry_Date__year=year)

            if period == "Monthly" and month:
                ledger_entries = ledger_entries.filter(JournalEntry_FK__Entry_Date__month=month)
            
            elif period == "Quarterly" and month:
                quarter_map = {
                    "1st Quarter": [1, 2, 3],
                    "2nd Quarter": [4, 5, 6],
                    "3rd Quarter": [7, 8, 9],
                    "4th Quarter": [10, 11, 12],
                }
                months = quarter_map.get(month, [])
                ledger_entries = ledger_entries.filter(JournalEntry_FK__Entry_Date__month__in=months)

            elif period == "Semi Annually" and month:
                semi_annual_map = {
                    "1st Half": [1, 2, 3, 4, 5, 6],
                    "2nd Half": [7, 8, 9, 10, 11, 12],
                }
                months = semi_annual_map.get(month, [])
                ledger_entries = ledger_entries.filter(JournalEntry_FK__Entry_Date__month__in=months)

            elif period == "Annual":
                # No additional month filter needed, just the year is enough
                pass

        response_data = []
        for entry in ledger_entries:
            journal_entry_serializer = JournalEntrySerializer(entry.JournalEntry_FK)
            journal_details_serializer = JournalEntryDetailsSerializer(entry)

            response_data.append({
                "journal_entry": journal_entry_serializer.data,
                "journal_details": journal_details_serializer.data
            })

        return JsonResponse(response_data, safe=False, status=status.HTTP_200_OK)
    

class TrialBalanceQueryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Get filtering parameters from request
        period = request.GET.get("period", None)
        year = request.GET.get("year", None)
        month = request.GET.get("month", None)

        # Apply filters to the query
        filters = Q(JournalEntry_FK__EntryStatus_FK=2)  # Only Approved entries

        # Apply date filters based on the selected period
        if year:
            filters &= Q(JournalEntry_FK__Entry_Date__year=year)

            if period == "Monthly" and month:
                filters &= Q(JournalEntry_FK__Entry_Date__month=month)
            
            elif period == "Quarterly" and month:
                quarter_map = {
                    "1st Quarter": [1, 2, 3],
                    "2nd Quarter": [4, 5, 6],
                    "3rd Quarter": [7, 8, 9],
                    "4th Quarter": [10, 11, 12],
                }
                months = quarter_map.get(month, [])
                filters &= Q(JournalEntry_FK__Entry_Date__month__in=months)

            elif period == "Semi Annually" and month:
                semi_annual_map = {
                    "1st Half": [1, 2, 3, 4, 5, 6],
                    "2nd Half": [7, 8, 9, 10, 11, 12],
                }
                months = semi_annual_map.get(month, [])
                filters &= Q(JournalEntry_FK__Entry_Date__month__in=months)

            elif period == "Annual":
                # No additional month filter needed, just the year is enough
                pass

        trial_balance = (
            JournalEntryDetails.objects
            .filter(filters)
            .values(
                "Account_FK__AccountCode",
                "Account_FK__AccountDesc",
                "Account_FK__AccountType_FK__AccountTypeDesc",
            )
            .annotate(
                total_debit=Sum("DebitAmount"),
                total_credit=Sum("CreditAmount")
            )
            .order_by(
                "Account_FK__AccountCode",
                Case(
                    When(Account_FK__AccountType_FK__AccountTypeDesc="Assets", then=Value(1)),
                    When(Account_FK__AccountType_FK__AccountTypeDesc="Expenses", then=Value(2)),
                    When(Account_FK__AccountType_FK__AccountTypeDesc="Liabilities", then=Value(3)),
                    When(Account_FK__AccountType_FK__AccountTypeDesc="Equity", then=Value(4)),
                    When(Account_FK__AccountType_FK__AccountTypeDesc="Income", then=Value(5)),
                    default=Value(6)
                ),
                "Account_FK__AccountType_FK__AccountTypeDesc",
            )
        )

        # Format response data
        trial_balance_data = []
        total_debit = 0
        total_credit = 0

        for account in trial_balance:
            account_type = account["Account_FK__AccountType_FK__AccountTypeDesc"]
            debit = account["total_debit"] or 0
            credit = account["total_credit"] or 0

            # Apply debit/credit nature calculation
            if account_type in ["Assets", "Expenses"]:
                balance = debit - credit
                debit = balance if balance > 0 else 0
                credit = abs(balance) if balance < 0 else 0
            else:  # Liabilities, Equity, Income
                balance = credit - debit
                credit = balance if balance > 0 else 0
                debit = abs(balance) if balance < 0 else 0

            trial_balance_data.append({
                "AccountCode": account["Account_FK__AccountCode"],
                "AccountDesc": account["Account_FK__AccountDesc"],
                "Debit": debit,
                "Credit": credit
            })

            total_debit += debit
            total_credit += credit

        # Add total row
        trial_balance_data.append({
            "AccountCode": "TOTAL",
            "AccountDesc": "",
            "Debit": total_debit,
            "Credit": total_credit
        })

        return Response(trial_balance_data)
    
class BalanceSheetQueryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Get filtering parameters from request
        period = request.GET.get("period", None)
        year = request.GET.get("year", None)
        month = request.GET.get("month", None)

        # Apply filters to the query
        filters = Q(JournalEntry_FK__EntryStatus_FK=2)  # Only Approved entries

        # Apply date filters based on the selected period
        if year:
            filters &= Q(JournalEntry_FK__Entry_Date__year=year)

            if period == "Monthly" and month:
                filters &= Q(JournalEntry_FK__Entry_Date__month=month)
            
            elif period == "Quarterly" and month:
                quarter_map = {
                    "1st Quarter": [1, 2, 3],
                    "2nd Quarter": [4, 5, 6],
                    "3rd Quarter": [7, 8, 9],
                    "4th Quarter": [10, 11, 12],
                }
                months = quarter_map.get(month, [])
                filters &= Q(JournalEntry_FK__Entry_Date__month__in=months)

            elif period == "Semi Annually" and month:
                semi_annual_map = {
                    "1st Half": [1, 2, 3, 4, 5, 6],
                    "2nd Half": [7, 8, 9, 10, 11, 12],
                }
                months = semi_annual_map.get(month, [])
                filters &= Q(JournalEntry_FK__Entry_Date__month__in=months)

            elif period == "Annual":
                pass

        balance_sheet = (
            JournalEntryDetails.objects
            .filter(filters)
            .values(
                "Account_FK__AccountCode",
                "Account_FK__AccountDesc",
                "Account_FK__AccountType_FK__AccountTypeDesc",
            )
            .annotate(
                total_debit=Sum("DebitAmount"),
                total_credit=Sum("CreditAmount")
            )
        )

        # Organize data into categories
        assets = []
        liabilities = []
        equity = []
        total_assets = 0
        total_liabilities = 0
        total_equity = 0

        for account in balance_sheet:
            account_type = account["Account_FK__AccountType_FK__AccountTypeDesc"]
            debit = account["total_debit"] or 0
            credit = account["total_credit"] or 0

            balance = debit - credit if account_type == "Assets" else credit - debit
            account_data = {
                "AccountCode": account["Account_FK__AccountCode"],
                "AccountDesc": account["Account_FK__AccountDesc"],
                "Balance": balance
            }

            if account_type == "Assets":
                assets.append(account_data)
                total_assets += balance
            elif account_type == "Liabilities":
                liabilities.append(account_data)
                total_liabilities += balance
            elif account_type == "Equity":
                equity.append(account_data)
                total_equity += balance

        # Ensure the balance equation holds
        total_liabilities_equity = total_liabilities + total_equity

        response_data = {
            "Assets": {
                "accounts": assets,
                "total": total_assets
            },
            "Liabilities": {
                "accounts": liabilities,
                "total": total_liabilities
            },
            "Equity": {
                "accounts": equity,
                "total": total_equity
            },
            "Balance Check": {
                "Assets": total_assets,
                "Liabilities + Equity": total_liabilities_equity,
                "Balanced": total_assets == total_liabilities_equity
            }
        }

        return Response(response_data)
    

class IncomeVsExpenses(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Get income accounts
            income_accounts = ChartOfAccs.objects.filter(AccountType_FK__AccountTypeDesc__iexact='Income')

            # Get expense accounts
            expense_accounts = ChartOfAccs.objects.filter(AccountType_FK__AccountTypeDesc__iexact='Expenses')

            # Get approved journal entries
            income_details = JournalEntryDetails.objects.filter(
                Account_FK__in=income_accounts,
                JournalEntry_FK__EntryStatus_FK=2  # Approved Entries
            )

            expense_details = JournalEntryDetails.objects.filter(
                Account_FK__in=expense_accounts,
                JournalEntry_FK__EntryStatus_FK=2  # Approved Entries
            )

            # Calculate totals
            total_income = income_details.aggregate(total=Sum(F('CreditAmount') - F('DebitAmount')))['total'] or 0
            total_expenses = expense_details.aggregate(total=Sum(F('DebitAmount') - F('CreditAmount')))['total'] or 0

            return Response({
                "total_income": total_income,
                "total_expenses": total_expenses
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
    