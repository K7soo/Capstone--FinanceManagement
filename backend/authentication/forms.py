from django import forms
from .models import Employee

class EmployeeCreationForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = ('username', 'email', 'first_name', 'last_name', 'job_title')
        
class SetupSecurityQuestionsForm(forms.Form):
    SECURITY_QUESTIONS = [
        ('What was the name of your first pet?', 'What was the name of your first pet?'),
        ('What was the model of your first car?', 'What was the model of your first car?'),
        ('In what city were you born?', 'In what city were you born?'),
        ('What was the name of your elementary school?', 'What was the name of your elementary school?'),
        ('What is your favorite book?', 'What is your favorite book?'),
        ('Who was your childhood hero?', 'Who was your childhood hero?'),
        ('What is the name of the street you grew up on?', 'What is the name of the street you grew up on?'),
        ('What was the make of your first smartphone?', 'What was the make of your first smartphone?'),
        ('What is your favorite food?', 'What is your favorite food?'),
        ('What is your mother\'s maiden name?', 'What is your mother\'s maiden name?'),
        ('What was the name of your first employer?', 'What was the name of your first employer?'),
        ('What is your favorite movie?', 'What is your favorite movie?'),
        ('What is your favorite place to visit?', 'What is your favorite place to visit?'),
        ('What is the name of your favorite childhood teacher?', 'What is the name of your favorite childhood teacher?'),
        ('What was your dream job as a child?', 'What was your dream job as a child?'),
        ('What was the name of your first best friend?', 'What was the name of your first best friend?'),
        ('What is the name of your favorite sports team?', 'What is the name of your favorite sports team?'),
        ('What was your high school mascot?', 'What was your high school mascot?'),
        ('What is the name of your favorite restaurant?', 'What is the name of your favorite restaurant?'),
        ('What is your favorite hobby?', 'What is your favorite hobby?'),
    ]

    security_question_1 = forms.ChoiceField(choices=SECURITY_QUESTIONS, label="Security Question 1")
    security_answer_1 = forms.CharField(max_length=255, widget=forms.TextInput(attrs={'placeholder': 'Type your answer here...'}))

    security_question_2 = forms.ChoiceField(choices=SECURITY_QUESTIONS, label="Security Question 2")
    security_answer_2 = forms.CharField(max_length=255, widget=forms.TextInput(attrs={'placeholder': 'Type your answer here...'}))

    security_question_3 = forms.ChoiceField(choices=SECURITY_QUESTIONS, label="Security Question 3")
    security_answer_3 = forms.CharField(max_length=255, widget=forms.TextInput(attrs={'placeholder': 'Type your answer here...'}))

class SetupPasswordForm(forms.Form):
    password = forms.CharField(
        widget=forms.PasswordInput,
        help_text="Password must be at least 8 characters and include a mix of letters, numbers, and symbols."
    )
    confirm_password = forms.CharField(
        widget=forms.PasswordInput,
        label="Confirm Password"
    )

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")
        if password and confirm_password and password != confirm_password:
            raise forms.ValidationError("Passwords do not match.")
        # Add additional password validation here (e.g., length, complexity)
        return cleaned_data
