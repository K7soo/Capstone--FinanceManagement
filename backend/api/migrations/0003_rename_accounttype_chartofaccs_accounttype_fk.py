# Generated by Django 5.1.1 on 2024-11-23 14:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_remove_accounttype_accounttype_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='chartofaccs',
            old_name='AccountType',
            new_name='AccountType_FK',
        ),
    ]
