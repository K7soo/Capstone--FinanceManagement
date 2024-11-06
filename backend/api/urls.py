from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard_view, name='home'),
    path('dashboard/', views.dashboard_view, name='dashboard'),

    # System Setup Dropdown Buttons
    path('crudacc/', views.crud_accounts_view, name='crudacc'),

    path('chartofacc/', views.chart_of_accounts_view, name='chartofacc'),
    path('journaltemp/', views.journal_templates_view, name='journaltemp'),


    # Transaction Dropdown Buttons
    path('trinbox/', views.transaction_inbox_view, name='trinbox'),
    path('journalentries/', views.journal_entries_view, name='journalentries'),
    path('jevapproval/', views.jev_approval_view, name='jevapproval'),
    path('trialbalance/', views.trial_balance_view, name='trialbalance'),
    
    # end of dropdown buttons components
    path('menubar/', views.menubar_view, name='menubar'),
    path('payment/', views.payment_view, name='payment'),
    path('reports/', views.reports_view, name='reports'),
]
