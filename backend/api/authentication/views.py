from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.utils import timezone
from django.contrib.auth.tokens import default_token_generator
from .models import Employee
from .forms import EmployeeCreationForm, SetupSecurityQuestionsForm, SetupPasswordForm
from datetime import datetime
import logging



logger = logging.getLogger(__name__)

def portal(request):
    logger.debug(f"User accessing portal: {request.path}")
    available_modules = [
        {'name': 'Reservation and Booking System', 'url': '/reservation/admin_login/'},
        {'name': 'Logistics Management System', 'url': '/logistics/admin_login/'},
        {'name': 'Finance Management System', 'url': '/finance/admin_login/'},
        {'name': 'System Admin', 'url': '/auth/system_admin_login/'}
    ]
    return render(request, 'portal.html', {'available_modules': available_modules})

# Custom login view for admin access
def admin_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('/auth/portal/')  # Redirect to portal after successful login
        else:
            return render(request, 'admin_login.html', {'error': 'Invalid username or password'})  # Handle invalid login
    return render(request, 'admin_login.html')

def system_admin_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('system_admin_dashboard')  # Redirect to system admin dashboard
        else:
            return render(request, 'system_admin_login.html', {'error': 'Invalid username or password'})  # Handle invalid login
    return render(request, 'system_admin_login.html')

@login_required
def system_admin_dashboard(request):
    if request.method == 'POST':
        form = EmployeeCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('system_admin_dashboard')
    else:
        form = EmployeeCreationForm()
    
    employees = Employee.objects.all()
    return render(request, 'system_admin_dashboard.html', {'employees': employees, 'form': form})

def add_employee(request):
    if request.method == 'POST':
        form = EmployeeCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('system_admin_dashboard')
    else:
        form = EmployeeCreationForm()
    return render(request, 'system_admin_dashboard.html', {'form': form, 'employees': Employee.objects.all()})


def change_status(request, employee_id, status):
    employee = get_object_or_404(Employee, id=employee_id)
    
    if status not in ['active', 'inactive', 'suspended']:
        # Handle invalid status
        return redirect('system_admin_dashboard')
    
    employee.account_status = status
    employee.save()
    return redirect('system_admin_dashboard')

def send_onboarding_email(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id)
    onboarding_email(employee)
    return redirect('system_admin_dashboard')

def send_reset_password_email(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id)
    # Logic to send reset password email
    return redirect('system_admin_dashboard')

def send_account_reactivation_email(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id)
    # Logic to send account reactivation email
    return redirect('system_admin_dashboard')

# Function to handle onboarding email setup
def onboarding_email(employee):
    token = default_token_generator.make_token(employee)
    uid = urlsafe_base64_encode(force_bytes(employee.pk))
    link = reverse('setup_account', kwargs={'uidb64': uid, 'token': token})
    full_link = f"http://127.0.0.1:8000{link}"

    email_subject = "Welcome to [Company/Organization]!"
    email_body = f"""
    Hi {employee.first_name},

    Welcome to [Company/Organization]! We’re excited to have you as part of our team.

    To complete your account setup, please follow the link below:
    {full_link}

    This link will guide you through the process of setting up your security questions and creating your password. For security purposes, the link is valid for 24 hours. If it expires before you have a chance to set up your account, you can request a new link through our portal.

    If you have any questions or need assistance during the setup process, feel free to reach out to us at [Support Email/Phone Number].

    We look forward to seeing you on board!

    Best regards,
    [Your Name/Team]
    [Company/Organization]

    Note: Please do not reply to this email. This mailbox is not monitored.
    """
    send_mail(
        email_subject,
        email_body,
        'tikmedine24@gmail.com',  # Replace with your sender email
        [employee.email],
    )

# Function to handle password reset email setup
def send_reset_password_email(employee):
    token = default_token_generator.make_token(employee)
    uid = urlsafe_base64_encode(force_bytes(employee.pk))
    link = reverse('reset_password', kwargs={'uidb64': uid, 'token': token})
    full_link = f"http://127.0.0.1:8000{link}"

    email_subject = "Password Reset Request"
    email_body = f"""
    Hi {employee.first_name},

    We received a request to reset the password for your account associated with this email address. If you made this request, please click the link below to reset your password:
    {full_link}

    For security reasons, this link will expire in 24 hours. If the link expires, you can request a new one through the "Forgot Password" link on the login page.

    If you did not request a password reset, please ignore this email or contact support immediately at [Support Email/Phone].

    Thank you,
    [Your Company/Team Name]

    Note: Please do not reply to this email. This mailbox is not monitored.
    """
    send_mail(
        email_subject,
        email_body,
        'tikmedine24@gmail.com',  # Replace with your sender email
        [employee.email],
    )

# Function to handle account reactivation email setup
def send_account_reactivation_email(employee):
    token = default_token_generator.make_token(employee)
    uid = urlsafe_base64_encode(force_bytes(employee.pk))
    link = reverse('reactivate_account', kwargs={'uidb64': uid, 'token': token})
    full_link = f"http://127.0.0.1:8000{link}"

    email_subject = "Account Reactivation Request"
    email_body = f"""
    Hi {employee.first_name},

    Your account has been reactivated. Please follow the link below to complete your account setup:
    {full_link}

    This link will guide you through the process of setting up your security questions and creating your password. For security purposes, the link is valid for 24 hours. If it expires before you have a chance to set up your account, you can request a new link through our portal.

    If you have any questions or need assistance during the setup process, feel free to reach out to us at [Support Email/Phone Number].

    We look forward to seeing you on board!

    Best regards,
    [Your Name/Team]
    [Company/Organization]

    Note: Please do not reply to this email. This mailbox is not monitored.
    """
    send_mail(
        email_subject,
        email_body,
        'tikmedine24@gmail.com',  # Replace with your sender email
        [employee.email],
    )


def setup_account(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        employee = Employee.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, Employee.DoesNotExist):
        employee = None

    if employee is not None and default_token_generator.check_token(employee, token):
        if request.method == 'POST':
            form = SetupSecurityQuestionsForm(request.POST)
            if form.is_valid():
                employee.security_answer_1 = form.cleaned_data['security_answer_1']
                employee.security_answer_2 = form.cleaned_data['security_answer_2']
                employee.security_answer_3 = form.cleaned_data['security_answer_3']
                employee.save()
                return redirect('setup_password', uidb64=uidb64, token=token)
        else:
            form = SetupSecurityQuestionsForm()
        return render(request, 'setup_security_questions.html', {'form': form, 'employee': employee})
    else:
        return render(request, 'invalid_link.html')

def setup_password(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        employee = Employee.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, Employee.DoesNotExist):
        employee = None

    if employee is not None and default_token_generator.check_token(employee, token):
        if request.method == 'POST':
            form = SetupPasswordForm(request.POST)
            if form.is_valid():
                employee.set_password(form.cleaned_data['password'])
                employee.save()
                return redirect('admin_login')
        else:
            form = SetupPasswordForm()
        return render(request, 'setup_password.html', {'form': form, 'employee': employee})
    else:
        return render(request, 'invalid_link.html')
    
def send_onboarding_confirmation_email(employee):
    email_subject = "Welcome to Tikme Dine - Account Setup Complete"
    email_body = f"""
    Dear {employee.first_name},

    Your account setup for Tikme Dine is complete. You can now access your account and start using our services.

    If you did not request this account setup, please contact our support team immediately at support@tikmedine.com.

    You can log in to your account here: [Insert Login Page Link]

    Best Regards,
    The Tikme Dine Team
    """
    send_mail(
        email_subject,
        email_body,
        'support@tikmedine.com',  # Replace with your sender email
        [employee.email],
        fail_silently=False,
    )


# View for resetting password
@login_required
def reset_password(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        employee = get_object_or_404(Employee, pk=uid)
    except (TypeError, ValueError, OverflowError, Employee.DoesNotExist):
        employee = None

    if employee is not None and default_token_generator.check_token(employee, token):
        if request.method == 'POST':
            if 'security_answer_1' in request.POST:
                form = SetupSecurityQuestionsForm(request.POST)
                if (form.cleaned_data['security_answer_1'] == employee.security_answer_1 and
                    form.cleaned_data['security_answer_2'] == employee.security_answer_2 and
                    form.cleaned_data['security_answer_3'] == employee.security_answer_3):
                    return redirect('setup_password', uidb64=uidb64, token=token)
                else:
                    form.add_error(None, "Security answers do not match.")
            else:
                form = SetupPasswordForm(request.POST)
                if form.is_valid():
                    employee.set_password(form.cleaned_data['password'])
                    employee.save()
                    send_reset_password_confirmation_email(employee)
                    return render(request, 'password_set_success.html')
        else:
            form = SetupSecurityQuestionsForm()
        return render(request, 'reset_password.html', {'form': form, 'employee': employee, 'uidb64': uidb64, 'token': token})
    else:
        return render(request, 'invalid_link.html')
    
def send_reset_password_confirmation_email(employee):
    email_subject = "Password Successfully Reset for Your Tikme Dine Account"
    email_body = f"""
    Dear {employee.first_name},

    We wanted to let you know that the password for your Tikme Dine account has been successfully reset.
    Date and Time of Change: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

    If you did not request this change, please contact our support team immediately at support@tikmedine.com.

    You can log in to your account here: [Insert Login Page Link]

    Best Regards,
    The Tikme Dine Team
    """
    send_mail(
        email_subject,
        email_body,
        'support@tikmedine.com',  # Replace with your sender email
        [employee.email],
        fail_silently=False,
    )

# View for account reactivation
@login_required
def reactivate_account(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        employee = Employee.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, Employee.DoesNotExist):
        employee = None

    if employee is not None and default_token_generator.check_token(employee, token):
        if request.method == 'POST':
            form = SetupPasswordForm(request.POST)
            if form.is_valid():
                employee.set_password(form.cleaned_data['password'])
                employee.save()
                return redirect('admin_login')
            else:
                logger.error(f"Form errors: {form.errors}")
        else:
            form = SetupPasswordForm()
        return render(request, 'reactivate_account.html', {'form': form, 'employee': employee})
    else:
        return render(request, 'invalid_link.html')
 
def send_reactivation_confirmation_email(employee):
    email_subject = "Password Successfully Set for Your Tikme Dine Account"
    email_body = f"""
    Dear {employee.first_name},

    We wanted to let you know that the password for your Tikme Dine account has been successfully set.
    Date and Time of Change: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

    If you did not request this change, please contact our support team immediately at support@tikmedine.com.

    You can log in to your account here: [Insert Login Page Link]

    Best Regards,
    The Tikme Dine Team
    """
    send_mail(
        email_subject,
        email_body,
        'support@tikmedine.com',  # Replace with your sender email
        [employee.email],
        fail_silently=False,
    )




