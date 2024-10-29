from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard_view, name='home'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('bookkeeping/', views.bookkeeping_view, name='bookkeeping'),
    path('trinbox/', views.transaction_inbox_view, name='trinbox'),

    # dropdown buttons
    path('chartofacc/', views.chart_of_accounts_view, name='chartofacc'),
    path('journaltemp/', views.journal_templates_view, name='journaltemp'),
    path('journalentries/', views.journal_entries_view, name='journalentries'),
    path('trialbalance/', views.trial_balance_view, name='trialbalance'),
    # end of dropdown buttons components
    path('menubar/', views.menubar_view, name='menubar'),
    path('payment/', views.payment_view, name='payment'),
    path('reports/', views.reports_view, name='reports'),
    
    # path('transactioninbox/', views.transactioninbox_view, name='transactioninbox'),
    # path('login/', views.login_view, name='login'),
    # path('', views.portal_view, name='home'),
]