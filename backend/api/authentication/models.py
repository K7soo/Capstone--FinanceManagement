from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class Employee(AbstractUser):
    security_answer_1 = models.CharField(max_length=255, blank=True, null=True)
    security_answer_2 = models.CharField(max_length=255, blank=True, null=True)
    security_answer_3 = models.CharField(max_length=255, blank=True, null=True)
    job_title = models.CharField(max_length=150, null=True, blank=True)
    account_status = models.CharField(max_length=50, default='pending')  # Set default status

    groups = models.ManyToManyField(
        Group,
        related_name='employee_user_set',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='employee_user_permissions_set',
        blank=True,
    )

    def __str__(self):
        return self.username
