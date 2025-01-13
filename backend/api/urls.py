from django.urls import path
from .views import *

urlpatterns = [
    # Authentication Prototype URL #
        path('admin_login/', views_.admin_login_view, name='authentication_api'),
    # Exposed API's
        # RRBS Prototype URL
        path('reservations-view/', views_api.ReservationsView.as_view(), name='reservations_api'),
        # LogMS Prototype URL
        path('orders-view/', views_api.OrderManagementView.as_view(), name='logistics_api'),
        
    # Dashboard #
    path('', views_.dashboard_view, name='dashboard'),
    # List of Accounts
    path('listofacc/', views_listacc.ListOfAccountsView.as_view(), name='listofacc'),
    path('listofacc-change/<int:pk>/', views_listacc.ListOfAccountsChangeView.as_view(), name='list_accounts_change_id'),
    # Chart of Accounts
    path('get-account-types/', views_charts.AccountTypeListView.as_view(), name='get_account_types'),
    path('chartofacc/', views_charts.ChartOfAccountsView.as_view(), name='chartofacc'),
    path('chartofacc/<int:pk>/', views_charts.ChartOfAccountDetailView.as_view(), name='chartofacc_detail'),
    # Journal Templates
    path('get-chart-types/', views_journtemp.ChartOfAccsListView.as_view(), name='get_chartofaccs'),
    path('get-transaction-types/', views_journtemp.TransactionTypeGet.as_view(), name='get_transactiontypes'),

    path('journaltemplate/', views_journtemp.JournalTemplateView.as_view(), name='journaltemplate'),
    path('journaltemplate/<int:pk>/', views_journtemp.JournalTemplateDetailView.as_view(), name='journaltemplatedetail'),
    path('journaltemplatedetails/', views_journtemp.TemplateBodyView.as_view(), name='journaltemplatebody'),
    path('journaltemplatedetails/<int:pk>/', views_journtemp.TemplateBodyDetailView.as_view(), name='journaltemplatebodydetail'),
    # Transaction Type
    path('transactiontype/', views_trtype.TransactionTypeView.as_view(), name='transactiontype'),
    path('transactiontype/<int:pk>', views_trtype.TransactionTypeDetailView.as_view(), name='transactiontype_detail'),
    # Transaction Inbox 
        path('trinbox/', views_.transaction_inbox_view, name='trinbox'),
    # Journal Entries 
    # path('journalentries/', views_.journal_entries_view, name='journalentries'),
    path("journalentries/", views_journentries.JournalEntryView.as_view(), name="journalentries"),
    path("journal-entries/<int:pk>/", views_journentries.JournalEntryDetailView.as_view(), name="journal_entry_detail"),
    path("journal-entry-details/", views_journentries.JournalEntryDetailsView.as_view(), name="journal_entry_detail_list"),
    path("journal-entry-details/<int:pk>/", views_journentries.JournalEntryDetailsView.as_view(), name="journal_entry_detail_detail"),
    # JEV Approval 
    path('jevapproval/', views_.jev_approval_view, name='jevapproval'),
    # Reports 
    path('reports/', views_.reports_view, name='reports'),
    # Trial Balance 
    path('trialbalance/', views_.trial_balance_view, name='trialbalance'),
    # General Journal
    path('generaljournal/', views_.general_journal_view, name='general_journal'),
    # General Ledger
    path('generalledger/', views_.general_ledger_view, name='general_ledger'),
]
    