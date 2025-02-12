from django.db.models import Sum, Q, F, Func
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import *
from rest_framework.permissions import AllowAny
from django.db.models.functions import TruncWeek, TruncMonth

class CashFlowQuery(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Define valid account descriptions
            valid_cash_accounts = ["Cash", "Cash in Bank", "Non Cash Account"]

            # Filter only Cash & Bank Accounts
            cash_accounts = ChartOfAccs.objects.filter(AccountDesc__in=valid_cash_accounts)

            # Get transactions for these accounts
            cash_entries = JournalEntryDetails.objects.filter(Account_FK__in=cash_accounts)

            # Group transactions by **week** and compute inflows/outflows
            cash_flow_data = (
                cash_entries
                .annotate(period=TruncWeek("JournalEntry_FK__Entry_Date"))  # Group by **week**
                .values("period")
                .annotate(
                    total_inflows=Sum("DebitAmount", default=0),  # Sum of all debit transactions
                    total_outflows=Sum("CreditAmount", default=0),  # Sum of all credit transactions
                    net_cash_flow=Sum(F("DebitAmount") - F("CreditAmount"), default=0)  # Compute Net Cash Flow
                )
                .order_by("period")  # Sort in ascending order (earliest first)
            )

            return Response(list(cash_flow_data))

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        

class IncomeVsExpensesOverTime(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Get income and expense accounts
            income_accounts = ChartOfAccs.objects.filter(AccountType_FK__AccountTypeDesc__iexact='Income')
            expense_accounts = ChartOfAccs.objects.filter(AccountType_FK__AccountTypeDesc__iexact='Expenses')

            # Filter journal details by approved status
            income_details = JournalEntryDetails.objects.filter(Account_FK__in=income_accounts, JournalEntry_FK__EntryStatus_FK=2)
            expense_details = JournalEntryDetails.objects.filter(Account_FK__in=expense_accounts, JournalEntry_FK__EntryStatus_FK=2)

            # Group data by week
            income_data = (
                income_details.annotate(period=TruncWeek("JournalEntry_FK__Entry_Date"))
                .values("period")
                .annotate(total_income=Sum(F('CreditAmount') - F('DebitAmount')))
                .order_by("period")
            )

            expense_data = (
                expense_details.annotate(period=TruncWeek("JournalEntry_FK__Entry_Date"))
                .values("period")
                .annotate(total_expenses=Sum(F('DebitAmount') - F('CreditAmount')))
                .order_by("period")
            )

            # Convert QuerySet to dictionary for easy merging
            income_dict = {entry["period"]: entry["total_income"] for entry in income_data}
            expense_dict = {entry["period"]: entry["total_expenses"] for entry in expense_data}

            # Merge income and expense data based on period (week)
            merged_data = []
            all_periods = sorted(set(income_dict.keys()) | set(expense_dict.keys()))

            for period in all_periods:
                merged_data.append({
                    "period": period.strftime("%Y-%m-%d"),
                    "total_income": income_dict.get(period, 0),
                    "total_expenses": expense_dict.get(period, 0)
                })

            return Response(merged_data)

        except Exception as e:
            return Response({"error": str(e)}, status=500)\
            

class DebtToEquityTrend(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Get Liabilities & Equity Accounts
            liabilities = ChartOfAccs.objects.filter(AccountType_FK__AccountTypeDesc="Liabilities")
            equity = ChartOfAccs.objects.filter(AccountType_FK__AccountTypeDesc="Owner's Equity")

            # Group by month & calculate totals
            debt_equity_data = (
                JournalEntryDetails.objects
                .annotate(period=TruncMonth("JournalEntry_FK__Entry_Date"))
                .values("period")
                .annotate(
                    total_liabilities=Sum("CreditAmount", filter=Q(Account_FK__in=liabilities)),
                    total_equity=Sum("CreditAmount", filter=Q(Account_FK__in=equity))
                )
                .order_by("period")
            )

            # Compute Debt-to-Equity Ratio
            formatted_data = []
            for entry in debt_equity_data:
                liabilities = entry["total_liabilities"] or 0
                equity = entry["total_equity"] or 1  # Prevent division by zero

                debt_to_equity_ratio = liabilities / equity
                formatted_data.append({
                    "period": entry["period"].strftime("%Y-%m-%d"),
                    "debt_to_equity_ratio": round(debt_to_equity_ratio, 2)
                })

            return Response(formatted_data)

        except Exception as e:
            return Response({"error": str(e)}, status=500)