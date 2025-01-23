from rest_framework import views, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
import logging

logger = logging.getLogger(__name__)

class ValidateTokenView(views.APIView):
    def post(self, request):
        # Retrieve the token from the request
        token = request.data.get('token')
        if not token:
            logger.error("Token is missing from the request.")
            return Response({"error": "Token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Decode and validate the token
            access_token = AccessToken(token)
            user_id = access_token.get('user_id')
            username = access_token.get('username', 'N/A')  # Optional: Add custom claims if present
            
            # Return user claims from the token
            return Response({
                "user_id": user_id,
                "username": username,
                "valid": True,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Token validation failed: {str(e)}")
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_401_UNAUTHORIZED)