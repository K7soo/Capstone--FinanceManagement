from django.urls import path
from . import views

urlpatterns = [
    path('', views.sidebar_view, name='home'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('bookkeeping/', views.bookkeeping_view, name='bookkeeping'),
    # dropdown buttons
    path('chartofacc/', views.chart_of_accounts_view, name='chartofacc'),
    path('journaltemp/', views.journal_templates_view, name='journaltemp'),
    path('journalentries/', views.journal_entries_view, name='journalentries'),
    path('trialbalance/', views.trial_balance_view, name='trialbalance'),
    # end of dropdown buttons components
    path('menubar/', views.menubar_view, name='menubar'),
    path('payment/', views.payment_view, name='payment'),
    path('reports/', views.reports_view, name='reports'),

    # TRTemplateDetails URLs
    path("trtemplate-details/", views.TRTemplateDetailsViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name="trtemplate-details-list-create"),
    path("trtemplate-details/<int:pk>/", views.TRTemplateDetailsViewSet.as_view(
        {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name="trtemplate-detail"),

    path("trtemplate/", views.TRTemplateViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name="trtemplate-list-create"),
    path("trtemplate/<int:pk>/", views.TRTemplateViewSet.as_view(
        {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name="trtemplate-detail"),

    # Transactions URLs
    path("transaction-details/", views.TransactionDetailsViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name="transaction-details-list-create"),
    path("transaction-details/<int:pk>/", views.TransactionDetailsViewSet.as_view(
        {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name="transaction-detail"),

    path("transactions/", views.TransactionsViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name="transactions-list-create"),
    path("transactions/<int:pk>/", views.TransactionsViewSet.as_view(
        {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name="transaction-detail"),

    path("transaction-type/", views.TransactionTypeViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name="transactiontype-list-create"),
    path("transaction-type/<int:pk>/", views.TransactionTypeViewSet.as_view(
        {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name="transactiontype-detail"),

    # ChartOfAccs URLs
    path("chart-of-accs/", views.ChartOfAccsViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name="chartofaccs-list-create"),
    path("chart-of-accs/<int:pk>/", views.ChartOfAccsViewSet.as_view(
        {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name="chartofaccs-detail"),

    # AccountType URLs
    path("account-type/", views.AccountTypeViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name="accounttype-list-create"),
    path("account-type/<int:pk>/", views.AccountTypeViewSet.as_view(
        {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name="accounttype-detail"),

    # Discounts URLs
    path("discounts/", views.DiscountsViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name="discounts-list-create"),
    path("discounts/<int:pk>/", views.DiscountsViewSet.as_view(
        {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name="discount-detail"),

    # Payments URLs
    path("payments/", views.PaymentsViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name="payments-list-create"),
    path("payments/<int:pk>/", views.PaymentsViewSet.as_view(
        {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name="payment-detail"),

    path("payment-gateway/", views.PaymentGatewayViewSet.as_view(
        {'get': 'list', 'post': 'create'}), name="paymentgateway-list-create"),
    path("payment-gateway/<int:pk>/", views.PaymentGatewayViewSet.as_view(
        {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name="paymentgateway-detail"),
]
