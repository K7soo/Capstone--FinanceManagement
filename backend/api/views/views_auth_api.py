from django.http import JsonResponse, HttpResponseRedirect
from django.utils.decorators import method_decorator
from django.views import View
from django.conf import settings
import jwt

# Secret key shared with the authentication microservice
SECRET_KEY = settings.SECRET_KEY  # Use the same secret as the microservice

class TokenValidationMixin:
    def validate_token(self, token):
        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return decoded  # Return decoded token if valid
        except jwt.ExpiredSignatureError:
            return {"error": "Token expired"}
        except jwt.InvalidTokenError:
            return {"error": "Invalid token"}

class FinanceDashboardView(View, TokenValidationMixin):
    def get(self, request):
        token = request.GET.get("token")  # Retrieve token from query parameters
        if not token:
            return JsonResponse({"error": "Token not provided"}, status=401)

        decoded_token = self.validate_token(token)
        if "error" in decoded_token:
            return JsonResponse(decoded_token, status=401)  # Return error if token is invalid

        # Ensure the user has access to the Finance system
        if decoded_token.get("module") != "Finance":
            return JsonResponse({"error": "Unauthorized access to this system"}, status=403)

        # Simulate user session creation
        request.session["user_id"] = decoded_token.get("sub")  # Store user ID in session
        request.session["roles"] = decoded_token.get("roles")  # Store user roles

        # Return the finance dashboard data
        return JsonResponse({
            "message": "Welcome to the Finance Dashboard",
            "user": decoded_token
        })

class RefreshTokenView(View):
    def post(self, request):
        refresh_token = request.POST.get("refresh_token")  # Retrieve refresh token from POST body
        if not refresh_token:
            return JsonResponse({"error": "Refresh token not provided"}, status=401)

        try:
            # Decode the refresh token using a refresh secret key
            decoded = jwt.decode(refresh_token, settings.REFRESH_SECRET_KEY, algorithms=["HS256"])

            # Generate a new access token
            new_access_token = jwt.encode(
                {"sub": decoded["sub"], "module": "Finance", "roles": decoded["roles"]},
                SECRET_KEY,
                algorithm="HS256"
            )

            return JsonResponse({"access_token": new_access_token})

        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Refresh token expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid refresh token"}, status=401)

class LogoutView(View):
    def post(self, request):
        # Clear the session
        request.session.flush()
        return JsonResponse({"message": "User logged out successfully"})

@method_decorator(TokenValidationMixin, name="dispatch")
class FinanceProtectedView(View, TokenValidationMixin):
    def get(self, request):
        token = request.GET.get("token")
        if not token:
            return JsonResponse({"error": "Token not provided"}, status=401)

        decoded_token = self.validate_token(token)
        if "error" in decoded_token:
            return JsonResponse(decoded_token, status=401)

        # Check permissions or roles
        if "finance_admin" not in decoded_token.get("roles", []):
            return JsonResponse({"error": "Permission denied"}, status=403)

        # Return protected data
        return JsonResponse({"message": "Access to protected finance data", "data": "Finance data here"})
