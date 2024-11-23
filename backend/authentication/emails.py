from django.core.mail import send_mail
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.conf import settings
import datetime

def send_reset_password_email(request, employee, is_reset_notification=False):
    """
    Sends an email with a password reset link to the given employee.
    """
    refresh = RefreshToken.for_user(employee)
    access_token = str(refresh.access_token)

    uid = urlsafe_base64_encode(force_bytes(employee.pk))
    link = reverse('reset_password', kwargs={'uidb64': uid, 'token': access_token})
    full_link = f"https://{request.get_host()}{link}"

    email_subject = "Password Reset Request" if not is_reset_notification else "Password Successfully Reset"
    email_body = f"""
    Dear {employee.first_name},

    Please use the following link to reset your password:
    {full_link}

    Best Regards,
    Tikme Dine Team
    """

    send_mail(email_subject, email_body, 'support@tikmedine.com', [employee.email], fail_silently=False)


def send_onboarding_email(request, employee):
    """
    Sends an onboarding email to the new employee with a setup link.
    """
    token = AccessToken.for_user(employee)
    uid = urlsafe_base64_encode(force_bytes(employee.pk))
    link = reverse('setup_account', kwargs={'uidb64': uid, 'token': str(token)})
    full_link = request.build_absolute_uri(link)

    email_subject = "Welcome to Tikme Dine!"
    email_body = f"""
    Hi {employee.first_name},

    Welcome to Tikme Dine! To complete your account setup, please follow the link below:
    {full_link}

    This link will guide you through setting up security questions and creating your password. It's valid for 24 hours.

    Best Regards,
    The Tikme Dine Team
    """

    send_mail(email_subject, email_body, settings.DEFAULT_FROM_EMAIL, [employee.email], fail_silently=False)


def send_account_locked_email(employee):
    """
    Sends an email notification when an account is temporarily locked.
    """
    email_subject = "Account Temporarily Locked"
    email_body = f"""
    Hi {employee.first_name},

    Your account has been temporarily locked due to multiple failed login attempts. Please try again after 24 hours.

    Best Regards,
    Tikme Dine Team
    """
    send_mail(email_subject, email_body, 'support@tikmedine.com', [employee.email], fail_silently=False)


def send_reactivation_confirmation_email(employee):
    """
    Sends an email confirming account reactivation.
    """
    email_subject = "Password Successfully Set for Your Tikme Dine Account"
    email_body = f"""
    Dear {employee.first_name},

    Your account password has been successfully updated on {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}.
    If this wasn't you, contact support immediately.

    Best Regards,
    Tikme Dine Team
    """
    send_mail(email_subject, email_body, 'support@tikmedine.com', [employee.email], fail_silently=False)


def send_permanently_locked_email(employee):
    """
    Sends an email when an account is permanently locked.
    """
    email_subject = "Account Permanently Locked"
    email_body = f"""
    Hi {employee.first_name},

    Your account has been permanently locked due to security reasons. Please contact support to resolve the issue.

    Best Regards,
    Tikme Dine Team
    """
    send_mail(email_subject, email_body, 'support@tikmedine.com', [employee.email], fail_silently=False)
