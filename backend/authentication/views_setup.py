# Standard Libraries
import logging

# Django Libraries
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.urls import reverse
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings

# Django REST Framework (DRF)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.exceptions import ValidationError


# Custom Imports
from .models import Employee
from .forms import SetupSecurityQuestionsForm, SetupPasswordForm
from .serializers import SetupSecurityQuestionsSerializer, SetupPasswordSerializer
from .utils import jwt_authenticate  # Custom JWT authentication utility

# Logging Configuration
logger = logging.getLogger(__name__)

# Views
@api_view(['GET', 'POST'])
def setup_account(request, uidb64, token):
    """
    View to handle setting up a new account by authenticating the token,
    decoding the UID, and serving the security questions form.
    """
    # Authenticate the user via JWT token from the request header
    user = jwt_authenticate(request)
    
    if not user:
        return JsonResponse({'error': 'Invalid or expired token.'}, status=status.HTTP_401_UNAUTHORIZED)

    # Decode the UID from the URL-safe base64
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        employee = get_object_or_404(Employee, pk=uid)
    except (TypeError, ValueError, OverflowError, Employee.DoesNotExist):
        return JsonResponse({'error': 'Invalid user ID or user does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if the decoded user matches the employee
    if str(employee.pk) != str(user.pk):
        return JsonResponse({'error': 'Token does not match the user.'}, status=status.HTTP_400_BAD_REQUEST)

    # Render the form for setting up security questions
    form = SetupSecurityQuestionsForm()
    return render(request, 'setup_security_questions.html', {
        'form': form,
        'employee': employee
    })

@api_view(['POST'])
def setup_security_questions(request):
    """
    API view for submitting the security questions form.
    """
    user = request.user  # The user should be authenticated via JWT

    if not user:
        return JsonResponse({'error': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = SetupSecurityQuestionsSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save(user=user)
            # Prepare the response for the next step in the setup process
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            token = str(AccessToken.for_user(user))  # Generate a new token for the next step
            return JsonResponse({
                "success": "Security questions set up successfully.",
                "url": reverse('setup_password', kwargs={'uidb64': uidb64, 'token': token})
            }, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            logger.error(f"Error in security question setup: {e}")
            return JsonResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # Return validation errors if serializer is not valid
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def setup_password(request, uidb64, token):
    """
    View for setting the password after validating the token and user.
    """
    # Decode the UID and validate the token
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        employee = get_object_or_404(Employee, pk=uid)
        AccessToken(token)  # This will raise an error if the token is invalid or expired
    except (TypeError, ValueError, OverflowError, Employee.DoesNotExist, TokenError):
        return JsonResponse({'error': 'Invalid link or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

    # Handle password setup when the request method is POST
    if request.method == 'POST':
        serializer = SetupPasswordSerializer(data=request.data)
        if serializer.is_valid():
            # Set the new password and save the employee record
            employee.set_password(serializer.validated_data['new_password1'])
            employee.save()
            return JsonResponse({
                'success_message': "Password set successfully.",
                'uidb64': uidb64,
                'token': token,
            }, status=status.HTTP_200_OK)

        # If validation fails, return errors
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Handle GET request - show the password setup form
    serializer = SetupPasswordSerializer()
    return render(request, 'setup_password.html', {
        'form': serializer.data,
        'uidb64': uidb64,
        'token': token,
    })
