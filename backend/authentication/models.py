from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models


class Employee(AbstractUser):
    ACCOUNT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
    ]

    security_question_1 = models.CharField(max_length=255, blank=True, null=True)
    security_answer_1 = models.CharField(max_length=255, blank=True, null=True)
    security_question_2 = models.CharField(max_length=255, blank=True, null=True)
    security_answer_2 = models.CharField(max_length=255, blank=True, null=True)
    security_question_3 = models.CharField(max_length=255, blank=True, null=True)
    security_answer_3 = models.CharField(max_length=255, blank=True, null=True)
    account_setup_complete = models.BooleanField(default=False)
    account_status = models.CharField(
        max_length=50,
        choices=ACCOUNT_STATUS_CHOICES,
        default='pending',
    )
    role = models.CharField(
        max_length=50,
        choices=[('system_admin', 'System Admin'), ('employee', 'Employee')],
        default='employee',
    )
    job_title = models.CharField(max_length=255, blank=True, null=True)

    # Override the reverse accessors for groups and permissions
    groups = models.ManyToManyField(
        Group,
        related_name="employee_groups",  # Custom related_name
        blank=True,
        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
        verbose_name="groups",
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name="employee_user_permissions",  # Custom related_name
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

    def is_system_admin(self):
        return self.role == 'system_admin'

    def is_employee(self):
        return self.role == 'employee'

    def __str__(self):
        return self.username
