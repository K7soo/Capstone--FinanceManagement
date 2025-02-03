from django.urls import path
from .views import *

urlpatterns = [
    # Authentication Token Accept URL #
        path('validate-token/', views_validate_token.ValidateTokenView.as_view(), name='validate_token'),
    # Exposed API's
        # URLs for Payment Gateway
        path('payment-record/', views_api.PaymentRecordView.as_view(), name='payment_api'),
        path('get-payments/', views_api.PaymentRecordRetrieveView.as_view(), name='trinbox'),
    
    # Dashboard #
    path('', views_.dashboard_view, name='dashboard'),
    # Status Retrieval
    path("entrystatuses/", views_status.EntryStatusListView.as_view(), name="entry_status_list"),
    path("entry-statuses/<int:pk>/", views_status.EntryStatusDetailView.as_view(), name="entry_status_detail"),
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
    path('journaltemplatefull/', views_journtemp.JournalTemplateOrig.as_view(), name='journaltemplates'),
    path('journaltemplate/<int:pk>/', views_journtemp.JournalTemplateDetailView.as_view(), name='journaltemplatedetail'),
    path('journaltemplatedetails/', views_journtemp.TemplateBodyView.as_view(), name='journaltemplatebody'),
    path('journaltemplatedetails/<int:pk>/', views_journtemp.TemplateBodyDetailView.as_view(), name='journaltemplatebodydetail'),
    # Transaction Type
    path('transactiontype/', views_trtype.TransactionTypeView.as_view(), name='transactiontype'),
    path('transactiontype/<int:pk>', views_trtype.TransactionTypeDetailView.as_view(), name='transactiontype_detail'),
    # Journal Entries 
    path("journalentries/", views_journentries.JournalEntryView.as_view(), name="journalentries"),
    path("journalentries/<int:pk>/", views_journentries.JournalRetrieveView.as_view(), name="journalentriespecified"),
    path("journalentriesdetail/<int:pk>/", views_journentries.JournalEntryDetailView.as_view(), name="journal_detail"),
    # JEV Approval 
    path('jevapproval/', views_.jev_approval_view, name='jevapproval'),
    # Configuration
    path('configuration/', views_.configuration_view, name='configuration'),
    # Reports 
    path('reports/', views_.reports_view, name='reports'),
    path('querygeneraljournal/', views_queries.JournalQueryView.as_view(), name='filter_journal_entries'),
    # -- Alternate path: path('generaljournalquery/', views_query_journal.JournalQueryView.as_view(), name='generaljournal'), -- #
]
    