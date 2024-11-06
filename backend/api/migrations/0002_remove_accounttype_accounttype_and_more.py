# Generated by Django 5.1.1 on 2024-10-30 22:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='accounttype',
            name='AccountType',
        ),
        migrations.AddField(
            model_name='accounttype',
            name='AccountTypeDesc',
            field=models.TextField(blank=True, default='No Description'),
        ),
        migrations.AlterField(
            model_name='accounttype',
            name='AccountName',
            field=models.CharField(max_length=50),
        ),
    ]