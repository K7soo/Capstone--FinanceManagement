from django.urls import path
from .views import *

urlpatterns = [
    # Authentication #
    path('', views_.admin_login_view, name='home'),
    path('admin_login/', views_.admin_login_view, name='admin_login'),

    # SIDEBAR COMPONENTS #
    # Dashboard #
    path('dashboard/', views_.dashboard_view, name='dashboard'),

    # System Setup Dropdown Buttons #
        # List of Accounts
    path('listofacc/', views_listacc.ListOfAccountsView.as_view(), name='listofacc'),
    path('listofacc-change/<int:pk>/', views_listacc.ListOfAccountsChangeView.as_view(), name='list_accounts_change_id'),
        
        # Chart of Accounts
    path('get-account-types/', views_charts.AccountTypeListView.as_view(), name='get_account_types'),
    path('chartofacc/', views_charts.ChartOfAccountsView.as_view(), name='chartofacc'),
    path('chartofacc/<int:pk>/', views_charts.ChartOfAccountDetailView.as_view(), name='chartofacc_detail'),

        # Journal Templates
    path('get-chart-types/', views_journtemp.ChartOfAccsListView.as_view(), name='get_chartofacc'),
    path('journaltemplate/', views_journtemp.JournalTemplatesView.as_view(), name='journaltemplate'),
    path('journaltemplate/<int:pk>/', views_journtemp.JournalTemplatesDetailView.as_view(), name='journaltemplate_detail'),

    # Transaction Type
    path('trtype/', views_trtype.TransactionTypeView.as_view(), name='transactiontype'),
    path('trtype/<int:pk>', views_trtype.TransactionTypeDetailView.as_view(), name='transactiontype_detail'),

    # Transaction Dropdown Buttons #
        # Transaction Inbox 
    path('trinbox/', views_.transaction_inbox_view, name='trinbox'),

        # Journal Entries 
    path('journalentries/', views_.journal_entries_view, name='journalentries'),

        # JEV Approval 
    path('jevapproval/', views_.jev_approval_view, name='jevapproval'),

    # Reports Dropdown #
        # Reports 
    path('reports/', views_.reports_view, name='reports'),
        # Trial Balance 
    path('trialbalance/', views_.trial_balance_view, name='trialbalance'),

    # Payments #
    path('payment/', views_.payment_view, name='payment'),

    # Rendering of Menubar
    path('menubar/', views_.menubar_view, name='menubar'),
]
