# authentication/urls.py
from django.urls import path
from .views import setup_account, setup_password, admin_login, portal, system_admin_login, system_admin_dashboard,change_status, send_onboarding_email, send_reset_password_email, send_account_reactivation_email, reset_password, reactivate_account, add_employee

urlpatterns = [
    path('', portal, name='portal'),

    path('admin_login/', admin_login, name='admin_login'),

    path('system_admin_login/', system_admin_login, name='system_admin_login'),

    path('system_admin_dashboard/', system_admin_dashboard, name='system_admin_dashboard'),

    path('add_employee/', add_employee, name='add_employee'),

    path('change_status/<int:employee_id>/<str:status>/', change_status, name='change_status'),

    path('send_onboarding_email/<int:employee_id>/', send_onboarding_email, name='send_onboarding_email'),

    path('send_reset_password_email/<int:employee_id>/', send_reset_password_email, name='send_reset_password_email'),

    path('send_account_reactivation_email/<int:employee_id>/', send_account_reactivation_email, name='send_account_reactivation_email'),

    path('setup/<uidb64>/<token>/', setup_account, name='setup_account'),

    path('setup_password/<uidb64>/<token>/', setup_password, name='setup_password'),

    path('reset_password/<uidb64>/<token>/', reset_password, name='reset_password'),

    path('reactivate_account/<uidb64>/<token>/', reactivate_account, name='reactivate_account'),



]



