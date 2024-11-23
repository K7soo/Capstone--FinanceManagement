# utils.py

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

def jwt_authenticate(request):
    # Extract the token from the authorization header
    auth = request.headers.get('Authorization')
    
    if auth and auth.startswith('Bearer '):
        token = auth[7:]  # Remove "Bearer " prefix
        try:
            # Validate and decode the token using JWTAuthentication
            valid_token = JWTAuthentication().get_validated_token(token)
            user = JWTAuthentication().get_user(valid_token)  # Get the user associated with the token
            return user
        except AuthenticationFailed:
            # Return None if token is invalid or expired
            return None
    return None
