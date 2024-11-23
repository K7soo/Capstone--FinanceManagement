from rest_framework import serializers
from .models import Employee
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _



class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'name', 'email', 'position']


# serializers.py
class SetupSecurityQuestionsSerializer(serializers.Serializer):
    security_question_1 = serializers.CharField(required=True)
    security_answer_1 = serializers.CharField(required=True)
    security_question_2 = serializers.CharField(required=True)
    security_answer_2 = serializers.CharField(required=True)
    security_question_3 = serializers.CharField(required=True)
    security_answer_3 = serializers.CharField(required=True)

    def save(self, user):
        user.security_question_1 = self.validated_data['security_question_1']
        user.security_answer_1 = self.validated_data['security_answer_1']
        user.security_question_2 = self.validated_data['security_question_2']
        user.security_answer_2 = self.validated_data['security_answer_2']
        user.security_question_3 = self.validated_data['security_question_3']
        user.security_answer_3 = self.validated_data['security_answer_3']
        user.account_status = 'active'
        user.save()


class SetupPasswordSerializer(serializers.Serializer):
    new_password1 = serializers.CharField(write_only=True, style={'input_type': 'password'}, max_length=128)
    new_password2 = serializers.CharField(write_only=True, style={'input_type': 'password'}, max_length=128)

    def validate(self, attrs):
        if attrs['new_password1'] != attrs['new_password2']:
            raise serializers.ValidationError("The two password fields must match.")
        
        validate_password(attrs['new_password1'])  # Use Django’s built-in password validation
        return attrs

    def save(self, employee):
        employee.set_password(self.validated_data['new_password1'])
        employee.save()
