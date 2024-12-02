from django.urls import path
from .views import *

urlpatterns = [
    # Authentication #
    path('', views_.admin_login_view, name='home'),
    
    path('admin_login/', views_.admin_login_view, name='admin_login'),

    # Exposed API's
        # RRBS -- Sample URL
        path('reservations-view/', views_api.ReservationsView.as_view(), name='reservations_view'),
    
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
    
    path('journaltemplate/', views_journtemp.JournalTemplateView.as_view(), name='journaltemplate'),
    
    path('journaltemplate/<int:pk>', views_journtemp.JournalTemplateDetailView.as_view(), name='journaltemplatedetail'),
    
    path('journaltemplatedetails/', views_journtemp.TemplateBodyView.as_view(), name='journaltemplatebody'),
    
    path('journaltemplatedetails/<int:pk>/', views_journtemp.TemplateBodyDetailView.as_view(), name='journaltemplatebody'),


    # Transaction Type
    path('transactiontype/', views_trtype.TransactionTypeView.as_view(), name='transactiontype'),
    
    path('transactiontype/<int:pk>', views_trtype.TransactionTypeDetailView.as_view(), name='transactiontype_detail'),


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
]
