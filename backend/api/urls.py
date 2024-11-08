from django.urls import path
from . import views, views_charts

urlpatterns = [
    # Authentication #
    path('', views.admin_login_view, name='home'),
    path('admin_login/', views.admin_login_view, name='admin_login'),

    # SIDEBAR COMPONENTS #

    # Dashboard #
    path('dashboard/', views.dashboard_view, name='dashboard'),

    # System Setup Dropdown Buttons #
        # List of Accounts
    path('listofacc/', views.list_of_accounts_view, name='listofacc'),
    path('listofacc-change/', views.list_of_accounts_change, name='list_accounts_change'),
    path('listofacc-change/<int:pk>/', views.list_of_accounts_change, name='list_accounts_change_id'),

        # Chart of Accounts
    path('chartofacc/', views.chart_of_accounts_view, name='chartofacc'),
    path('get-account-types/', views_charts.get_account_types, name='getaccs'),

        # Journal Templates
    path('journaltemp/', views.journal_templates_view, name='journaltemp'),


    # Transaction Dropdown Buttons #
        # Transaction Inbox 
    path('trinbox/', views.transaction_inbox_view, name='trinbox'),

        # Journal Entries 
    path('journalentries/', views.journal_entries_view, name='journalentries'),

        # JEV Approval 
    path('jevapproval/', views.jev_approval_view, name='jevapproval'),

    # Reports Dropdown #
        # Reports 
    path('reports/', views.reports_view, name='reports'),
        # Trial Balance 
    path('trialbalance/', views.trial_balance_view, name='trialbalance'),

    # Payments #
    path('payment/', views.payment_view, name='payment'),

    # Rendering of Menubar
    path('menubar/', views.menubar_view, name='menubar'),
]
